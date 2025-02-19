import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import crypto from 'crypto';
import { Request as ExpressRequest } from 'express';
import {
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  LotteryStatusEnum,
  Prisma,
  YesNoEnum,
} from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Application } from '../dtos/applications/application.dto';
import { mapTo } from '../utilities/mapTo';
import { ApplicationQueryParams } from '../dtos/applications/application-query-params.dto';
import { calculateSkip, calculateTake } from '../utilities/pagination-helpers';
import { buildOrderByForApplications } from '../utilities/build-order-by';
import { buildPaginationInfo } from '../utilities/build-pagination-meta';
import { IdDTO } from '../dtos/shared/id.dto';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { ApplicationViews } from '../enums/applications/view-enum';
import { ApplicationUpdate } from '../dtos/applications/application-update.dto';
import { ApplicationCreate } from '../dtos/applications/application-create.dto';
import { PaginatedApplicationDto } from '../dtos/applications/paginated-application.dto';
import { EmailService } from './email.service';
import { PermissionService } from './permission.service';
import Listing from '../dtos/listings/listing.dto';
import { User } from '../dtos/users/user.dto';
import { permissionActions } from '../enums/permissions/permission-actions-enum';
import { GeocodingService } from './geocoding.service';
import { MostRecentApplicationQueryParams } from '../dtos/applications/most-recent-application-query-params.dto';
import { PublicAppsViewQueryParams } from '../dtos/applications/public-apps-view-params.dto';
import { ApplicationsFilterEnum } from '../enums/applications/filter-enum';
import { PublicAppsViewResponse } from '../dtos/applications/public-apps-view-response.dto';

export const view: Partial<
  Record<ApplicationViews, Prisma.ApplicationsInclude>
> = {
  partnerList: {
    applicant: {
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthMonth: true,
        birthDay: true,
        birthYear: true,
        emailAddress: true,
        noEmail: true,
        phoneNumber: true,
        phoneNumberType: true,
        noPhone: true,
        workInRegion: true,
        applicantAddress: {
          select: {
            id: true,
            placeName: true,
            city: true,
            county: true,
            state: true,
            street: true,
            street2: true,
            zipCode: true,
            latitude: true,
            longitude: true,
          },
        },
        applicantWorkAddress: {
          select: {
            id: true,
            placeName: true,
            city: true,
            county: true,
            state: true,
            street: true,
            street2: true,
            zipCode: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    },
    householdMember: {
      select: {
        id: true,
        orderId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthMonth: true,
        birthDay: true,
        birthYear: true,
        sameAddress: true,
        relationship: true,
        workInRegion: true,
      },
    },
    accessibility: {
      select: {
        id: true,
        mobility: true,
        vision: true,
        hearing: true,
      },
    },
    applicationsMailingAddress: {
      select: {
        id: true,
        placeName: true,
        city: true,
        county: true,
        state: true,
        street: true,
        street2: true,
        zipCode: true,
        latitude: true,
        longitude: true,
      },
    },
    applicationsAlternateAddress: {
      select: {
        id: true,
        placeName: true,
        city: true,
        county: true,
        state: true,
        street: true,
        street2: true,
        zipCode: true,
        latitude: true,
        longitude: true,
      },
    },
    alternateContact: {
      select: {
        id: true,
        type: true,
        otherType: true,
        firstName: true,
        lastName: true,
        agency: true,
        phoneNumber: true,
        emailAddress: true,
        address: {
          select: {
            id: true,
            placeName: true,
            city: true,
            county: true,
            state: true,
            street: true,
            street2: true,
            zipCode: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    },
    listings: {
      select: {
        id: true,
      },
    },
    preferredUnitTypes: {
      select: {
        id: true,
        name: true,
        numBedrooms: true,
      },
    },
  },
};

view.base = {
  ...view.partnerList,
  demographics: {
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      ethnicity: true,
      gender: true,
      sexualOrientation: true,
      howDidYouHear: true,
      race: true,
    },
  },
  listings: {
    select: {
      id: true,
      name: true,
      jurisdictions: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  householdMember: {
    select: {
      id: true,
      orderId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthMonth: true,
      birthDay: true,
      birthYear: true,
      sameAddress: true,
      relationship: true,
      workInRegion: true,
      householdMemberAddress: {
        select: {
          id: true,
          placeName: true,
          city: true,
          county: true,
          state: true,
          street: true,
          street2: true,
          zipCode: true,
          latitude: true,
          longitude: true,
        },
      },
      householdMemberWorkAddress: {
        select: {
          id: true,
          placeName: true,
          city: true,
          county: true,
          state: true,
          street: true,
          street2: true,
          zipCode: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  },
};

view.details = {
  ...view.base,
  userAccounts: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

/*
  this is the service for applicationss
  it handles all the backend's business logic for reading/writing/deleting application data
*/
@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private permissionService: PermissionService,
    private geocodingService: GeocodingService,
  ) {}

  /*
    this will get a set of applications given the params passed in
    this set can either be paginated or not depending on the params
    it will return both the set of applications, and some meta information to help with pagination
  */
  async list(
    params: ApplicationQueryParams,
    req: ExpressRequest,
  ): Promise<PaginatedApplicationDto> {
    const user = mapTo(User, req['user']);
    if (!user) {
      throw new ForbiddenException();
    }
    const whereClause = this.buildWhereClause(params);

    const count = await this.prisma.applications.count({
      where: whereClause,
    });

    const rawApplications = await this.prisma.applications.findMany({
      skip: calculateSkip(params.limit, params.page),
      take: calculateTake(params.limit),
      orderBy: buildOrderByForApplications([params.orderBy], [params.order]),
      include: view[params.listingId ? 'partnerList' : 'base'],
      where: whereClause,
    });

    await Promise.all(
      rawApplications.map(async (application) => {
        await this.authorizeAction(
          user,
          application.listings?.id,
          permissionActions.read,
          application.userId,
        );
      }),
    );

    const applications = mapTo(Application, rawApplications);

    const promiseArray = applications.map((application) =>
      this.getDuplicateFlagsForApplication(application.id),
    );

    const flags = await Promise.all(promiseArray);
    applications.forEach((application, index) => {
      application.flagged = !!flags[index]?.id;
    });

    return {
      items: applications,
      meta: buildPaginationInfo(
        params.limit,
        params.page,
        count,
        applications.length,
      ),
    };
  }

  /*
    this will the most recent application the user has submitted
  */
  async mostRecentlyCreated(
    params: MostRecentApplicationQueryParams,
    req: ExpressRequest,
  ): Promise<Application> {
    const rawApplication = await this.prisma.applications.findFirst({
      select: {
        id: true,
      },
      orderBy: { createdAt: 'desc' },
      where: {
        userId: params.userId,
      },
    });

    if (!rawApplication) {
      return null;
    }

    return await this.findOne(rawApplication.id, req);
  }

  /*
    this will get the required app/associated listing information for the public account display
    it will only show applications matching the status passed in via params
  */
  async publicAppsView(
    params: PublicAppsViewQueryParams,
    req: ExpressRequest,
  ): Promise<PublicAppsViewResponse> {
    const user = mapTo(User, req['user']);
    if (!user) {
      throw new ForbiddenException();
    }
    const whereClause = this.buildWhereClause(params);
    const rawApps = await this.prisma.applications.findMany({
      select: {
        id: true,
        userId: true,
        confirmationCode: true,
        updatedAt: true,
        listings: {
          select: {
            id: true,
            name: true,
            status: true,
            lotteryLastPublishedAt: true,
            lotteryStatus: true,
            applicationDueDate: true,
            listingEvents: {
              select: {
                startDate: true,
              },
              where: { type: ListingEventsTypeEnum.publicLottery },
            },
          },
        },
        applicationLotteryPositions: {
          select: {
            id: true,
          },
        },
      },
      where: whereClause,
    });

    await Promise.all(
      rawApps.map(async (application) => {
        await this.authorizeAction(
          user,
          application.listings?.id,
          permissionActions.read,
          application.userId,
        );
      }),
    );

    //filter for display applications and status counts
    let displayApplications = [];
    const total = rawApps.length ?? 0;
    let lottery = 0,
      closed = 0,
      open = 0;
    rawApps.forEach((app) => {
      if (app.listings.status === ListingsStatusEnum.active) {
        open++;
        if (params.filterType === ApplicationsFilterEnum.open)
          displayApplications.push(app);
      } else if (
        app.listings?.lotteryStatus === LotteryStatusEnum.publishedToPublic &&
        params.includeLotteryApps
      ) {
        lottery++;
        if (params.filterType === ApplicationsFilterEnum.lottery) {
          displayApplications.push(app);
        }
      } else {
        closed++;
        if (params.filterType === ApplicationsFilterEnum.closed)
          displayApplications.push(app);
      }
    });

    if (params.filterType === ApplicationsFilterEnum.all)
      displayApplications = rawApps;

    return mapTo(PublicAppsViewResponse, {
      displayApplications,
      applicationsCount: { total, lottery, closed, open },
    });
  }

  /*
    this builds the where clause for list()
  */
  buildWhereClause(
    params: ApplicationQueryParams,
  ): Prisma.ApplicationsWhereInput {
    const toReturn: Prisma.ApplicationsWhereInput[] = [];

    if (params.userId) {
      toReturn.push({
        userAccounts: {
          id: params.userId,
        },
      });
    }
    if (params.listingId) {
      toReturn.push({
        listingId: params.listingId,
      });
    }
    if (params.search) {
      const searchFilter: Prisma.StringFilter = {
        contains: params.search,
        mode: 'insensitive',
      };
      toReturn.push({
        OR: [
          {
            confirmationCode: searchFilter,
          },
          {
            applicant: {
              firstName: searchFilter,
            },
          },
          {
            applicant: {
              lastName: searchFilter,
            },
          },
          {
            applicant: {
              emailAddress: searchFilter,
            },
          },
          {
            applicant: {
              phoneNumber: searchFilter,
            },
          },
          {
            alternateContact: {
              firstName: searchFilter,
            },
          },
          {
            alternateContact: {
              lastName: searchFilter,
            },
          },
          {
            alternateContact: {
              emailAddress: searchFilter,
            },
          },
          {
            alternateContact: {
              phoneNumber: searchFilter,
            },
          },
        ],
      });
    }
    if (params.markedAsDuplicate !== undefined) {
      toReturn.push({
        markedAsDuplicate: params.markedAsDuplicate,
      });
    }
    // We only should display non-deleted applications
    toReturn.push({
      deletedAt: null,
    });
    return {
      AND: toReturn,
    };
  }

  /*
    this is to calculate the `flagged` property of an application
    ideally in the future we save this data on the application so we don't have to keep
    recalculating it
  */
  async getDuplicateFlagsForApplication(applicationId: string): Promise<IdDTO> {
    return this.prisma.applications.findFirst({
      select: {
        id: true,
      },
      where: {
        id: applicationId,
        applicationFlaggedSet: {
          some: {},
        },
      },
    });
  }

  /*
    this will return 1 application or error
  */
  async findOne(
    applicationId: string,
    req: ExpressRequest,
  ): Promise<Application> {
    const user = mapTo(User, req['user']);
    if (!user) {
      throw new ForbiddenException();
    }

    const rawApplication = await this.findOrThrow(
      applicationId,
      ApplicationViews.details,
    );

    const application = mapTo(Application, rawApplication);

    await this.authorizeAction(
      user,
      application.listings?.id,
      permissionActions.read,
      rawApplication.userId,
    );

    return application;
  }

  /*
    this will create an application
  */
  async create(
    dto: ApplicationCreate,
    forPublic: boolean,
    requestingUser: User,
  ): Promise<Application> {
    if (!forPublic) {
      await this.authorizeAction(
        requestingUser,
        dto.listings.id,
        permissionActions.create,
      );
    }

    const listing = await this.prisma.listings.findUnique({
      where: {
        id: dto.listings.id,
      },
      include: {
        jurisdictions: true,
        // multiselect questions and address is needed for geocoding
        listingMultiselectQuestions: {
          include: {
            multiselectQuestions: true,
          },
        },
        listingsBuildingAddress: true,
      },
    });
    // if its a public submission
    if (forPublic) {
      // SubmissionDate is time the application was created for public
      dto.submissionDate = new Date();
      // if there is no common app or submission is after the application due date
      if (
        !(listing.digitalApplication && listing.commonDigitalApplication) ||
        (listing?.applicationDueDate &&
          dto.submissionDate > listing.applicationDueDate)
      ) {
        throw new BadRequestException(
          `Listing is not open for application submission`,
        );
      }
    }

    const rawApplication = await this.prisma.applications.create({
      data: {
        ...dto,
        confirmationCode: this.generateConfirmationCode(),
        applicant: dto.applicant
          ? {
              create: {
                ...dto.applicant,
                applicantAddress: {
                  create: {
                    ...dto.applicant.applicantAddress,
                  },
                },
                applicantWorkAddress: {
                  create: {
                    ...dto.applicant.applicantWorkAddress,
                  },
                },
                firstName: dto.applicant.firstName?.trim(),
                lastName: dto.applicant.lastName?.trim(),
                birthDay: dto.applicant.birthDay
                  ? Number(dto.applicant.birthDay)
                  : undefined,
                birthMonth: dto.applicant.birthMonth
                  ? Number(dto.applicant.birthMonth)
                  : undefined,
                birthYear: dto.applicant.birthYear
                  ? Number(dto.applicant.birthYear)
                  : undefined,
              },
            }
          : undefined,
        accessibility: dto.accessibility
          ? {
              create: {
                ...dto.accessibility,
              },
            }
          : undefined,
        alternateContact: dto.alternateContact
          ? {
              create: {
                ...dto.alternateContact,
                address: {
                  create: {
                    ...dto.alternateContact.address,
                  },
                },
              },
            }
          : undefined,
        applicationsAlternateAddress: dto.applicationsAlternateAddress
          ? {
              create: {
                ...dto.applicationsAlternateAddress,
              },
            }
          : undefined,
        applicationsMailingAddress: dto.applicationsMailingAddress
          ? {
              create: {
                ...dto.applicationsMailingAddress,
              },
            }
          : undefined,
        listings: dto.listings
          ? {
              connect: {
                id: dto.listings.id,
              },
            }
          : undefined,
        demographics: dto.demographics
          ? {
              create: {
                ...dto.demographics,
              },
            }
          : undefined,
        preferredUnitTypes: dto.preferredUnitTypes
          ? {
              connect: dto.preferredUnitTypes.map((unitType) => ({
                id: unitType.id,
              })),
            }
          : undefined,
        householdMember: dto.householdMember
          ? {
              create: dto.householdMember.map((member) => ({
                ...member,
                sameAddress: member.sameAddress || YesNoEnum.no,
                workInRegion: member.workInRegion || YesNoEnum.no,
                householdMemberAddress: {
                  create: {
                    ...member.householdMemberAddress,
                  },
                },
                householdMemberWorkAddress: {
                  create: {
                    ...member.householdMemberWorkAddress,
                  },
                },
                firstName: member.firstName?.trim(),
                lastName: member.lastName?.trim(),
                birthDay: member.birthDay ? Number(member.birthDay) : undefined,
                birthMonth: member.birthMonth
                  ? Number(member.birthMonth)
                  : undefined,
                birthYear: member.birthYear
                  ? Number(member.birthYear)
                  : undefined,
              })),
            }
          : undefined,
        programs: dto.programs as unknown as Prisma.JsonArray,
        preferences: dto.preferences as unknown as Prisma.JsonArray,
        userAccounts: requestingUser
          ? {
              connect: {
                id: requestingUser.id,
              },
            }
          : undefined,
      },
      include: view.details,
    });

    const mappedApplication = mapTo(Application, rawApplication);
    if (dto.applicant.emailAddress && forPublic) {
      this.emailService.applicationConfirmation(
        mapTo(Listing, listing),
        mappedApplication,
        listing.jurisdictions?.publicUrl,
      );
    }
    // Update the lastApplicationUpdateAt to now after every submission
    await this.updateListingApplicationEditTimestamp(listing.id);

    // Calculate geocoding preferences after save and email sent
    if (listing.jurisdictions?.enableGeocodingPreferences) {
      try {
        void this.geocodingService.validateGeocodingPreferences(
          mappedApplication,
          mapTo(Listing, listing),
        );
      } catch (e) {
        // If the geocoding fails it should not prevent the request from completing so
        // catching all errors here
        console.warn('error while validating geocoding preferences');
      }
    }

    return mappedApplication;
  }

  /*
    this will update an application
    if no application has the id of the incoming argument an error is thrown
  */
  async update(
    dto: ApplicationUpdate,
    requestingUser: User,
  ): Promise<Application> {
    const rawApplication = await this.findOrThrow(dto.id);

    await this.authorizeAction(
      requestingUser,
      rawApplication.listingId,
      permissionActions.update,
    );

    // All connected household members should be deleted so they can be recreated in the update below.
    // This solves for all cases of deleted members, updated members, and new members
    await this.prisma.householdMember.deleteMany({
      where: {
        applicationId: dto.id,
      },
    });

    const res = await this.prisma.applications.update({
      where: {
        id: dto.id,
      },
      include: view.details,
      data: {
        ...dto,
        id: undefined,
        applicant: dto.applicant
          ? {
              create: {
                ...dto.applicant,
                applicantAddress: {
                  create: {
                    ...dto.applicant.applicantAddress,
                  },
                },
                applicantWorkAddress: {
                  create: {
                    ...dto.applicant.applicantWorkAddress,
                  },
                },
                firstName: dto.applicant.firstName?.trim(),
                lastName: dto.applicant.lastName?.trim(),
                birthDay: dto.applicant.birthDay
                  ? Number(dto.applicant.birthDay)
                  : undefined,
                birthMonth: dto.applicant.birthMonth
                  ? Number(dto.applicant.birthMonth)
                  : undefined,
                birthYear: dto.applicant.birthYear
                  ? Number(dto.applicant.birthYear)
                  : undefined,
              },
            }
          : undefined,
        accessibility: dto.accessibility
          ? {
              create: {
                ...dto.accessibility,
              },
            }
          : undefined,
        alternateContact: dto.alternateContact
          ? {
              create: {
                ...dto.alternateContact,
                address: {
                  create: {
                    ...dto.alternateContact.address,
                  },
                },
              },
            }
          : undefined,
        applicationsAlternateAddress: dto.applicationsAlternateAddress
          ? {
              create: {
                ...dto.applicationsAlternateAddress,
              },
            }
          : undefined,
        applicationsMailingAddress: dto.applicationsMailingAddress
          ? {
              create: {
                ...dto.applicationsMailingAddress,
              },
            }
          : undefined,
        listings: dto.listings
          ? {
              connect: {
                id: dto.listings.id,
              },
            }
          : undefined,
        demographics: dto.demographics
          ? {
              create: {
                ...dto.demographics,
              },
            }
          : undefined,
        preferredUnitTypes: dto.preferredUnitTypes
          ? {
              connect: dto.preferredUnitTypes.map((unitType) => ({
                id: unitType.id,
              })),
            }
          : undefined,
        householdMember: dto.householdMember
          ? {
              create: dto.householdMember.map((member) => ({
                ...member,
                sameAddress: member.sameAddress || YesNoEnum.no,
                workInRegion: member.workInRegion || YesNoEnum.no,
                householdMemberAddress: {
                  create: {
                    ...member.householdMemberAddress,
                  },
                },
                householdMemberWorkAddress: {
                  create: {
                    ...member.householdMemberWorkAddress,
                  },
                },
                firstName: member.firstName?.trim(),
                lastName: member.lastName?.trim(),
                birthDay: member.birthDay ? Number(member.birthDay) : undefined,
                birthMonth: member.birthMonth
                  ? Number(member.birthMonth)
                  : undefined,
                birthYear: member.birthYear
                  ? Number(member.birthYear)
                  : undefined,
              })),
            }
          : undefined,
        programs: dto.programs as unknown as Prisma.JsonArray,
        preferences: dto.preferences as unknown as Prisma.JsonArray,
      },
    });

    const listing = await this.prisma.listings.findFirst({
      where: { id: dto.listings.id },
      include: {
        jurisdictions: true,
        listingMultiselectQuestions: {
          include: { multiselectQuestions: true },
        },
      },
    });
    const application = mapTo(Application, res);

    // Calculate geocoding preferences after save and email sent
    if (listing?.jurisdictions?.enableGeocodingPreferences) {
      try {
        void this.geocodingService.validateGeocodingPreferences(
          application,
          mapTo(Listing, listing),
        );
      } catch (e) {
        // If the geocoding fails it should not prevent the request from completing so
        // catching all errors here
        console.warn('error while validating geocoding preferences');
      }
    }

    await this.updateListingApplicationEditTimestamp(res.listingId);
    return application;
  }

  /*
    this will mark an application as deleted by setting the deletedAt column for the application
  */
  async delete(
    applicationId: string,
    requestingUser: User,
  ): Promise<SuccessDTO> {
    const application = await this.findOrThrow(applicationId);

    await this.authorizeAction(
      requestingUser,
      application.listingId,
      permissionActions.delete,
    );

    await this.updateListingApplicationEditTimestamp(application.listingId);
    await this.prisma.applications.update({
      where: {
        id: applicationId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  /*
    finds the requested listing or throws an error
  */
  async findOrThrow(applicationId: string, includeView?: ApplicationViews) {
    const res = await this.prisma.applications.findUnique({
      where: {
        id: applicationId,
      },
      include: view[includeView] ?? undefined,
    });

    if (!res) {
      throw new NotFoundException(
        `applicationId ${applicationId} was requested but not found`,
      );
    }

    return res;
  }

  /*
    updates a listing's lastApplicationUpdateAt date
  */
  async updateListingApplicationEditTimestamp(
    listingId: string,
  ): Promise<void> {
    await this.prisma.listings.update({
      where: {
        id: listingId,
      },
      data: {
        lastApplicationUpdateAt: new Date(),
      },
    });
  }

  async authorizeAction(
    user: User,
    listingId: string,
    action: permissionActions,
    applicantUserId?: string,
  ): Promise<void> {
    const listingJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: {
        listings: {
          some: {
            id: listingId,
          },
        },
      },
    });
    await this.permissionService.canOrThrow(user, 'application', action, {
      listingId,
      jurisdictionId: listingJurisdiction?.id,
      userId: applicantUserId,
    });
  }

  /*
    generates a random confirmation code
  */
  generateConfirmationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
