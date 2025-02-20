import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import crypto from 'crypto';
import { verify, sign } from 'jsonwebtoken';
import { Request } from 'express';

import { PrismaService } from './prisma.service';
import { User } from '../dtos/users/user.dto';
import { mapTo } from '../utilities/mapTo';
import {
  buildPaginationMetaInfo,
  calculateSkip,
  calculateTake,
} from '../utilities/pagination-helpers';
import { buildOrderBy } from '../utilities/build-order-by';
import { UserQueryParams } from '../dtos/users/user-query-param.dto';
import { PaginatedUserDto } from '../dtos/users/paginated-user.dto';
import { OrderByEnum } from '../enums/shared/order-by-enum';
import { UserUpdate } from '../dtos/users/user-update.dto';
import { isPasswordValid, passwordToHash } from '../utilities/password-helpers';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { EmailAndAppUrl } from '../dtos/users/email-and-app-url.dto';
import { ConfirmationRequest } from '../dtos/users/confirmation-request.dto';
import { IdDTO } from '../dtos/shared/id.dto';
import { UserInvite } from '../dtos/users/user-invite.dto';
import { UserCreate } from '../dtos/users/user-create.dto';
import { EmailService } from './email.service';
import { PermissionService } from './permission.service';
import { permissionActions } from '../enums/permissions/permission-actions-enum';
import { UserViews } from '../enums/user/view-enum';
import { buildWhereClause } from '../utilities/build-user-where';
import { getPublicEmailURL } from '../utilities/get-public-email-url';
import { UserRole } from '../dtos/users/user-role.dto';
import { RequestSingleUseCode } from '../dtos/single-use-code/request-single-use-code.dto';
import { getSingleUseCode } from '../utilities/get-single-use-code';
import { UserFavoriteListing } from '../dtos/users/user-favorite-listing.dto';
import { ModificationEnum } from '../enums/shared/modification-enum';

/*
  this is the service for users
  it handles all the backend's business logic for reading/writing/deleting user data
*/

const views: Partial<Record<UserViews, Prisma.UserAccountsInclude>> = {
  base: {
    jurisdictions: true,
    userRoles: true,
  },
};

views.full = {
  ...views.base,
  listings: true,
  favoriteListings: {
    select: {
      id: true,
      name: true,
    },
  },
};

type findByOptions = {
  userId?: string;
  email?: string;
  resetToken?: string;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
    private permissionService: PermissionService,
  ) {
    dayjs.extend(advancedFormat);
  }

  /*
    this will get a set of users given the params passed in
    Only users with a user role of admin or jurisdictional admin can get the list of available users.
    This means we don't need to account for a user with only the partner role when it comes to accessing this function
  */
  async list(params: UserQueryParams, user: User): Promise<PaginatedUserDto> {
    const whereClause = buildWhereClause(params, user);
    const count = await this.prisma.userAccounts.count({
      where: whereClause,
    });

    // if passed in page and limit would result in no results because there aren't that many listings
    // revert back to the first page
    let page = params.page;
    if (count && params.limit && params.limit !== 'all' && params.page > 1) {
      if (Math.ceil(count / params.limit) < params.page) {
        page = 1;
      }
    }

    const rawUsers = await this.prisma.userAccounts.findMany({
      skip: calculateSkip(params.limit, page),
      take: calculateTake(params.limit),
      orderBy: buildOrderBy(
        ['firstName', 'lastName'],
        [OrderByEnum.ASC, OrderByEnum.ASC],
      ),
      include: views.full,
      where: whereClause,
    });

    const users = mapTo(User, rawUsers);

    const paginationInfo = buildPaginationMetaInfo(params, count, users.length);

    return {
      items: users,
      meta: paginationInfo,
    };
  }

  /*
    this will return 1 user or error
  */
  async findOne(userId: string): Promise<User> {
    const rawUser = await this.findUserOrError(
      { userId: userId },
      UserViews.full,
    );
    return mapTo(User, rawUser);
  }

  /*
    this will update a user or error if no user is found with the Id
  */
  async update(
    dto: UserUpdate,
    requestingUser: User,
    jurisdictionName: string,
  ): Promise<User> {
    const storedUser = await this.findUserOrError(
      { userId: dto.id },
      UserViews.full,
    );

    if (dto.jurisdictions?.length) {
      // if the incoming dto has jurisdictions make sure the user has access to update users in that jurisdiction
      await Promise.all(
        dto.jurisdictions.map(async (jurisdiction) => {
          await this.permissionService.canOrThrow(
            requestingUser,
            'user',
            permissionActions.update,
            {
              id: dto.id,
              jurisdictionId: jurisdiction.id,
            },
          );
        }),
      );
    } else {
      // if the incoming dto has no jurisdictions make sure the user has access to update the user
      await this.permissionService.canOrThrow(
        requestingUser,
        'userProfile',
        permissionActions.update,
        {
          id: dto.id,
        },
      );
    }

    let passwordHash: string;
    let passwordUpdatedAt: Date;
    if (dto.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          `userID ${dto.id}: request missing currentPassword`,
        );
      }
      if (
        !(await isPasswordValid(storedUser.passwordHash, dto.currentPassword))
      ) {
        throw new UnauthorizedException(
          `userID ${dto.id}: incoming password doesn't match stored password`,
        );
      }

      passwordHash = await passwordToHash(dto.password);
      passwordUpdatedAt = new Date();
      delete dto.password;
    }

    let confirmationToken: string;
    if (dto.newEmail && dto.appUrl) {
      confirmationToken = this.createConfirmationToken(
        storedUser.id,
        dto.newEmail,
      );

      const confirmationUrl = this.getPublicConfirmationUrl(
        dto.appUrl,
        confirmationToken,
      );

      await this.emailService.changeEmail(
        dto.jurisdictions && dto.jurisdictions[0]
          ? dto.jurisdictions[0].name
          : jurisdictionName,
        mapTo(User, storedUser),
        dto.appUrl,
        confirmationUrl,
        dto.newEmail,
      );
    }

    // only update userRoles if something has changed
    if (dto.userRoles && storedUser.userRoles) {
      if (
        this.isUserRoleChangeAllowed(requestingUser, dto.userRoles) &&
        !(
          dto.userRoles.isAdmin === storedUser.userRoles.isAdmin &&
          dto.userRoles.isJurisdictionalAdmin ===
            storedUser.userRoles.isJurisdictionalAdmin &&
          dto.userRoles.isPartner === storedUser.userRoles.isPartner
        )
      ) {
        await this.prisma.userRoles.update({
          data: {
            ...dto.userRoles,
          },
          where: {
            userId: storedUser.id,
          },
        });
      }
    }

    // disconnect existing connected listings/jurisdictions
    if (storedUser.listings?.length) {
      await this.prisma.userAccounts.update({
        data: {
          listings: {
            disconnect: storedUser.listings.map((listing) => ({
              id: listing.id,
            })),
          },
        },
        where: {
          id: dto.id,
        },
      });
    }
    if (storedUser.jurisdictions?.length) {
      await this.prisma.userAccounts.update({
        data: {
          jurisdictions: {
            disconnect: storedUser.jurisdictions.map((jurisdiction) => ({
              id: jurisdiction.id,
            })),
          },
        },
        where: {
          id: dto.id,
        },
      });
    }

    const res = await this.prisma.userAccounts.update({
      include: views.full,
      data: {
        email: dto.email,
        agreedToTermsOfService: dto.agreedToTermsOfService,
        passwordHash: passwordHash ?? undefined,
        passwordUpdatedAt: passwordUpdatedAt ?? undefined,
        confirmationToken: confirmationToken ?? undefined,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        dob: dto.dob,
        phoneNumber: dto.phoneNumber,
        language: dto.language,
        listings: dto.listings
          ? {
              connect: dto.listings.map((listing) => ({ id: listing.id })),
            }
          : undefined,
        jurisdictions: dto.jurisdictions
          ? {
              connect: dto.jurisdictions.map((jurisdiction) => ({
                id: jurisdiction.id,
              })),
            }
          : undefined,
      },
      where: {
        id: dto.id,
      },
    });

    return mapTo(User, res);
  }

  /*
    this will delete a user or error if no user is found with the Id
  */
  async delete(userId: string, requestingUser: User): Promise<SuccessDTO> {
    const targetUser = await this.findUserOrError(
      { userId: userId },
      UserViews.base,
    );

    this.authorizeAction(
      requestingUser,
      mapTo(User, targetUser),
      permissionActions.delete,
    );

    await this.prisma.userRoles.delete({
      where: {
        userId: userId,
      },
    });

    await this.prisma.userAccounts.delete({
      where: {
        id: userId,
      },
    });

    return {
      success: true,
    } as SuccessDTO;
  }

  /*
    resends a confirmation email or errors if no user matches the incoming email
    if forPublic is true then we resend a confirmation for a public site user
    if forPublic is false then we resend a confirmation for a partner site user
  */
  async resendConfirmation(
    dto: EmailAndAppUrl,
    forPublic: boolean,
  ): Promise<SuccessDTO> {
    const storedUser = await this.findUserOrError(
      { email: dto.email },
      UserViews.full,
    );

    if (!storedUser.confirmedAt) {
      const confirmationToken = this.createConfirmationToken(
        storedUser.id,
        storedUser.email,
      );
      await this.prisma.userAccounts.update({
        data: {
          confirmationToken: confirmationToken,
        },
        where: {
          id: storedUser.id,
        },
      });

      if (forPublic) {
        const confirmationUrl = this.getPublicConfirmationUrl(
          dto.appUrl,
          confirmationToken,
        );
        await this.emailService.welcome(
          storedUser.jurisdictions && storedUser.jurisdictions.length
            ? storedUser.jurisdictions[0].name
            : null,
          storedUser as unknown as User,
          dto.appUrl,
          confirmationUrl,
        );
      } else {
        const confirmationUrl = this.getPartnersConfirmationUrl(
          dto.appUrl,
          confirmationToken,
        );
        await this.emailService.invitePartnerUser(
          storedUser.jurisdictions,
          storedUser as unknown as User,
          dto.appUrl,
          confirmationUrl,
        );
      }
    }

    return {
      success: true,
    } as SuccessDTO;
  }

  /*
    sets a reset token so a user can recover their account if they forgot the password
  */
  async forgotPassword(dto: EmailAndAppUrl): Promise<SuccessDTO> {
    const storedUser = await this.findUserOrError(
      { email: dto.email },
      UserViews.full,
    );

    const isPartnerPortalUser =
      storedUser.userRoles?.isAdmin ||
      storedUser.userRoles?.isJurisdictionalAdmin ||
      storedUser.userRoles?.isPartner;
    const isUserSiteMatch = async () => {
      if (isPartnerPortalUser) {
        return dto.appUrl === process.env.PARTNERS_PORTAL_URL;
      } else {
        //temporary solution since users can currently log into other jurisdictions' public site
        const juris = await this.prisma.jurisdictions.findFirst({
          select: {
            id: true,
          },
          where: {
            publicUrl: dto.appUrl,
          },
        });
        return !!juris;
      }
    };
    // user on wrong site, return neutral message and don't send email
    if (!(await isUserSiteMatch())) return { success: true };

    const payload = {
      id: storedUser.id,
      exp: Number.parseInt(dayjs().add(1, 'hour').format('X')),
    };
    const resetToken = sign(payload, process.env.APP_SECRET);
    await this.prisma.userAccounts.update({
      data: {
        resetToken: resetToken,
      },
      where: {
        id: storedUser.id,
      },
    });
    await this.emailService.forgotPassword(
      storedUser.jurisdictions,
      mapTo(User, storedUser),
      dto.appUrl,
      resetToken,
    );
    return {
      success: true,
    } as SuccessDTO;
  }

  /*
    checks to see if the confirmation token is valid
    sets the hitConfirmationUrl field on the user if the user exists
  */
  async isUserConfirmationTokenValid(
    dto: ConfirmationRequest,
  ): Promise<SuccessDTO> {
    try {
      const token = verify(dto.token, process.env.APP_SECRET) as IdDTO;

      const storedUser = await this.prisma.userAccounts.findUnique({
        where: {
          id: token.id,
        },
      });

      await this.setHitConfirmationUrl(
        storedUser?.id,
        storedUser?.confirmationToken,
        dto.token,
      );

      return {
        success: true,
      } as SuccessDTO;
    } catch (_) {
      try {
        const storedUser = await this.prisma.userAccounts.findFirst({
          where: {
            confirmationToken: dto.token,
          },
        });
        await this.setHitConfirmationUrl(
          storedUser?.id,
          storedUser?.confirmationToken,
          dto.token,
        );
      } catch (e) {
        console.error('isUserConfirmationTokenValid error = ', e);
      }
    }
  }

  /*
    Updates the hitConfirmationUrl for the user
    this is so we can tell if a user attempted to confirm their account
  */
  async setHitConfirmationUrl(
    userId: string,
    confirmationToken: string,
    token: string,
  ): Promise<void> {
    if (!userId) {
      throw new NotFoundException(
        `user confirmation token ${token} was requested but not found`,
      );
    }
    if (confirmationToken !== token) {
      throw new BadRequestException('tokenMissing');
    }
    await this.prisma.userAccounts.update({
      data: {
        hitConfirmationUrl: new Date(),
      },
      where: {
        id: userId,
      },
    });
  }

  /*
    creates a new user
    takes in either the dto for creating a public user or the dto for creating a partner user
    if forPartners is true then we are creating a partner, otherwise we are creating a public user
    if sendWelcomeEmail is true then we are sending a public user a welcome email
  */
  async create(
    dto: UserCreate | UserInvite,
    forPartners: boolean,
    sendWelcomeEmail = false,
    req: Request,
  ): Promise<User> {
    const requestingUser = mapTo(User, req['user']);
    const jurisdictionName = (req.headers['jurisdictionname'] as string) || '';

    if (
      this.containsInvalidCharacters(dto.firstName) ||
      this.containsInvalidCharacters(dto.lastName)
    ) {
      throw new ForbiddenException(
        `${dto.firstName} ${dto.lastName} was found to be invalid`,
      );
    }

    if (forPartners) {
      await this.authorizeAction(
        requestingUser,
        mapTo(User, dto),
        permissionActions.confirm,
      );
    }
    const existingUser = await this.prisma.userAccounts.findUnique({
      include: views.full,
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      // if attempting to recreate an existing user
      if (!existingUser.userRoles && 'userRoles' in dto) {
        // existing user && public user && user will get roles -> trying to grant partner access to a public user
        const res = await this.prisma.userAccounts.update({
          include: views.full,
          data: {
            userRoles: {
              create: {
                ...dto.userRoles,
              },
            },
            listings: {
              connect: dto.listings.map((listing) => ({ id: listing.id })),
            },
            confirmationToken:
              existingUser.confirmationToken ||
              this.createConfirmationToken(existingUser.id, existingUser.email),
            confirmedAt: null,
          },
          where: {
            id: existingUser.id,
          },
        });
        return mapTo(User, res);
      } else if (
        existingUser?.userRoles?.isPartner &&
        'userRoles' in dto &&
        dto?.userRoles?.isPartner &&
        this.jurisdictionMismatch(dto.jurisdictions, existingUser.jurisdictions)
      ) {
        // recreating a partner with jurisdiction mismatch -> giving partner a new jurisdiction
        const jursidictions = existingUser.jurisdictions
          .map((juris) => ({ id: juris.id }))
          .concat(dto.jurisdictions);

        const listings = existingUser.listings
          .map((juris) => ({ id: juris.id }))
          .concat(dto.listings);

        const res = await this.prisma.userAccounts.update({
          include: views.full,
          data: {
            jurisdictions: {
              connect: jursidictions.map((juris) => ({ id: juris.id })),
            },
            listings: {
              connect: listings.map((listing) => ({ id: listing.id })),
            },
          },
          where: {
            id: existingUser.id,
          },
        });

        return mapTo(User, res);
      } else {
        // existing user && ((partner user -> trying to recreate user) || (public user -> trying to recreate a public user))
        throw new ConflictException('emailInUse');
      }
    }

    let passwordHash = '';
    if (forPartners) {
      passwordHash = await passwordToHash(
        crypto.randomBytes(8).toString('hex'),
      );
    } else {
      passwordHash = await passwordToHash((dto as UserCreate).password);
    }

    let jurisdictions:
      | {
          jurisdictions: Prisma.JurisdictionsCreateNestedManyWithoutUser_accountsInput;
        }
      | Record<string, never> = dto.jurisdictions
      ? {
          jurisdictions: {
            connect: dto.jurisdictions.map((juris) => ({
              id: juris.id,
            })),
          },
        }
      : {};

    if (!forPartners && jurisdictionName) {
      jurisdictions = {
        jurisdictions: {
          connect: {
            name: jurisdictionName,
          },
        },
      };
    }

    let newUser = await this.prisma.userAccounts.create({
      data: {
        passwordHash: passwordHash,
        email: dto.email,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        dob: dto.dob,
        phoneNumber: dto.phoneNumber,
        language: dto.language,
        mfaEnabled: forPartners,
        ...jurisdictions,
        userRoles:
          'userRoles' in dto
            ? {
                create: {
                  ...dto.userRoles,
                },
              }
            : undefined,
        listings: dto.listings
          ? {
              connect: dto.listings.map((listing) => ({
                id: listing.id,
              })),
            }
          : undefined,
      },
    });

    const confirmationToken = this.createConfirmationToken(
      newUser.id,
      newUser.email,
    );
    newUser = await this.prisma.userAccounts.update({
      include: views.full,
      data: {
        confirmationToken: confirmationToken,
      },
      where: {
        id: newUser.id,
      },
    });

    // Public user that needs email
    if (!forPartners && sendWelcomeEmail) {
      const fullJurisdiction = await this.prisma.jurisdictions.findFirst({
        where: {
          name: jurisdictionName as string,
        },
      });

      if (fullJurisdiction?.allowSingleUseCodeLogin) {
        this.requestSingleUseCode(dto, req);
      } else {
        const confirmationUrl = this.getPublicConfirmationUrl(
          dto.appUrl,
          confirmationToken,
        );
        await this.emailService.welcome(
          jurisdictionName,
          mapTo(User, newUser),
          dto.appUrl,
          confirmationUrl,
        );
      }
    } else if (forPartners) {
      const confirmationUrl = this.getPartnersConfirmationUrl(
        this.configService.get('PARTNERS_PORTAL_URL'),
        confirmationToken,
      );
      await this.emailService.invitePartnerUser(
        dto.jurisdictions,
        mapTo(User, newUser),
        this.configService.get('PARTNERS_PORTAL_URL'),
        confirmationUrl,
      );
    }

    if (!forPartners) {
      await this.connectUserWithExistingApplications(newUser.email, newUser.id);
    }

    return mapTo(User, newUser);
  }

  /*
    connects a newly created public user with any applications they may have already submitted
  */
  async connectUserWithExistingApplications(
    newUserEmail: string,
    newUserId: string,
  ): Promise<void> {
    const applications = await this.prisma.applications.findMany({
      where: {
        applicant: {
          emailAddress: newUserEmail,
        },
        userAccounts: null,
      },
    });

    for (const app of applications) {
      await this.prisma.applications.update({
        data: {
          userAccounts: {
            connect: {
              id: newUserId,
            },
          },
        },
        where: {
          id: app.id,
        },
      });
    }
  }

  /*
    this will return 1 user or error
    takes in a userId or email to find by, and a boolean to indicate if joins should be included
  */
  async findUserOrError(findBy: findByOptions, view?: UserViews) {
    const where: Prisma.UserAccountsWhereUniqueInput = {
      id: undefined,
      email: undefined,
    };
    if (findBy.userId) {
      where.id = findBy.userId;
    } else if (findBy.email) {
      where.email = findBy.email;
    }
    const rawUser = await this.prisma.userAccounts.findUnique({
      include: view ? views[view] : undefined,
      where,
    });

    if (!rawUser) {
      let str = '';
      if (findBy.userId) {
        str = `id: ${findBy.userId}`;
      } else if (findBy.email) {
        str = `email: ${findBy.email}`;
      }
      throw new NotFoundException(`user ${str} was requested but not found`);
    }

    return rawUser;
  }

  async authorizeAction(
    requestingUser: User,
    targetUser: User,
    action: permissionActions,
  ): Promise<void> {
    if (!requestingUser) {
      throw new UnauthorizedException(
        `User attempted ${action} wihtout being signed in`,
      );
    }

    if (!requestingUser.userRoles?.isJurisdictionalAdmin) {
      // if its an admin, partner, or a user without roles
      await this.permissionService.canOrThrow(requestingUser, 'user', action, {
        id: targetUser.id,
      });
    } else if (targetUser.userRoles?.isAdmin) {
      // if its a jurisdictional admin trying to perform an action on an admin user
      throw new ForbiddenException(
        `a jurisdictional admin is attempting to ${action} an admin user`,
      );
    } else {
      // jurisdictional admins should only be allowed to perform an action on a user if they share a jurisdiction
      const requesterJurisdictions = requestingUser.jurisdictions?.map(
        (juris) => juris.id,
      );
      const targetJurisdictions = targetUser.jurisdictions?.map(
        (juris) => juris.id,
      );

      if (
        !requesterJurisdictions.some((juris) =>
          targetJurisdictions.includes(juris),
        )
      ) {
        throw new ForbiddenException(
          `a jurisdictional admin is attempting to ${action} a user they do not share a jurisdiction with`,
        );
      }
    }
  }

  /*
    encodes a confirmation token given a userId and email
  */
  createConfirmationToken(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
      exp: Number.parseInt(dayjs().add(24, 'hours').format('X')),
    };
    return sign(payload, process.env.APP_SECRET);
  }

  /*
    constructs the url to confirm a public site user
  */
  getPublicConfirmationUrl(appUrl: string, confirmationToken: string) {
    return getPublicEmailURL(appUrl, confirmationToken);
  }

  /*
    constructs the url to confirm the partner site user
  */
  getPartnersConfirmationUrl(appUrl: string, confirmationToken: string) {
    return `${appUrl}/users/confirm?token=${confirmationToken}`;
  }

  /*
    verify that there is a jurisdictional difference between the incoming user and the existing user
  */
  jurisdictionMismatch(
    incomingJurisdictions: IdDTO[],
    existingJurisdictions: IdDTO[],
  ): boolean {
    return (
      incomingJurisdictions.reduce((misMatched, jurisdiction) => {
        if (
          !existingJurisdictions?.some(
            (existingJuris) => existingJuris.id === jurisdiction.id,
          )
        ) {
          misMatched.push(jurisdiction.id);
        }
        return misMatched;
      }, []).length > 0
    );
  }

  containsInvalidCharacters(value: string): boolean {
    return value.includes('.') || value.includes('http');
  }

  isUserRoleChangeAllowed(
    requestingUser: User,
    userRoleChange: UserRole,
  ): boolean {
    if (requestingUser?.userRoles?.isAdmin) {
      return true;
    } else if (requestingUser?.userRoles?.isJurisdictionalAdmin) {
      if (userRoleChange?.isAdmin) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   *
   * @param dto the incoming request with the email
   * @returns a SuccessDTO always, and if the user exists it will send a code to the requester
   */
  async requestSingleUseCode(
    dto: RequestSingleUseCode,
    req: Request,
  ): Promise<SuccessDTO> {
    const user = await this.prisma.userAccounts.findFirst({
      where: { email: dto.email },
      include: {
        jurisdictions: true,
      },
    });
    if (!user) {
      return { success: true };
    }

    const jurisdictionName = req?.headers?.jurisdictionname;
    if (!jurisdictionName) {
      throw new BadRequestException(
        'jurisdictionname is missing from the request headers',
      );
    }

    const juris = await this.prisma.jurisdictions.findFirst({
      select: {
        id: true,
        allowSingleUseCodeLogin: true,
      },
      where: {
        name: jurisdictionName as string,
      },
      orderBy: {
        allowSingleUseCodeLogin: OrderByEnum.DESC,
      },
    });

    if (!juris) {
      throw new BadRequestException(
        `Jurisidiction ${jurisdictionName} does not exists`,
      );
    }

    const singleUseCode = getSingleUseCode(
      Number(process.env.MFA_CODE_LENGTH),
      user.singleUseCode,
      user.singleUseCodeUpdatedAt,
      Number(process.env.MFA_CODE_VALID),
    );
    await this.prisma.userAccounts.update({
      data: {
        singleUseCode,
        singleUseCodeUpdatedAt: new Date(),
      },
      where: {
        id: user.id,
      },
    });

    await this.emailService.sendSingleUseCode(mapTo(User, user), singleUseCode);

    return { success: true };
  }

  async modifyFavoriteListings(dto: UserFavoriteListing, requestingUser: User) {
    const listing = await this.prisma.listings.findUnique({
      where: {
        id: dto.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        `listingId ${dto.id} was requested but not found`,
      );
    }

    let dateClause;
    switch (dto.action) {
      case ModificationEnum.add:
        dateClause = {
          connect: { id: dto.id },
        };
        break;
      case ModificationEnum.remove:
        dateClause = {
          disconnect: { id: dto.id },
        };
        break;
    }

    const rawResults = await this.prisma.userAccounts.update({
      data: {
        favoriteListings: dateClause,
      },
      include: views.full,
      where: {
        id: requestingUser.id,
      },
    });

    return mapTo(User, rawResults);
  }
}
