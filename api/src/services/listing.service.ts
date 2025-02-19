import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  LanguagesEnum,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  Prisma,
  ReviewOrderTypeEnum,
  UserRoleEnum,
} from '@prisma/client';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { ApplicationFlaggedSetService } from './application-flagged-set.service';
import { EmailService } from './email.service';
import { PermissionService } from './permission.service';
import { PrismaService } from './prisma.service';
import { TranslationService } from './translation.service';
import { AmiChart } from '../dtos/ami-charts/ami-chart.dto';
import { Listing } from '../dtos/listings/listing.dto';
import { ListingCreate } from '../dtos/listings/listing-create.dto';
import { ListingDuplicate } from '../dtos/listings/listing-duplicate.dto';
import { ListingMapMarker } from '../dtos/listings/listing-map-marker.dto';
import { ListingFilterParams } from '../dtos/listings/listings-filter-params.dto';
import { ListingsQueryBody } from '../dtos/listings/listings-query-body.dto';
import { ListingsQueryParams } from '../dtos/listings/listings-query-params.dto';
import { ListingUpdate } from '../dtos/listings/listing-update.dto';
import { IdDTO } from '../dtos/shared/id.dto';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { User } from '../dtos/users/user.dto';
import { ListingViews } from '../enums/listings/view-enum';
import { ListingFilterKeys } from '../enums/listings/filter-key-enum';
import { permissionActions } from '../enums/permissions/permission-actions-enum';
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';
import { buildFilter } from '../utilities/build-filter';
import { buildOrderByForListings } from '../utilities/build-order-by';
import { startCronJob } from '../utilities/cron-job-starter';
import { mapTo } from '../utilities/mapTo';
import {
  buildPaginationMetaInfo,
  calculateSkip,
  calculateTake,
} from '../utilities/pagination-helpers';
import {
  summarizeUnitsByTypeAndRent,
  summarizeUnits,
} from '../utilities/unit-utilities';

export type getListingsArgs = {
  skip: number;
  take: number;
  orderBy: any;
  where: Prisma.ListingsWhereInput;
};

export const views: Partial<Record<ListingViews, Prisma.ListingsInclude>> = {
  fundamentals: {
    jurisdictions: true,
    listingsBuildingAddress: true,
    reservedCommunityTypes: true,
    listingImages: {
      include: {
        assets: true,
      },
    },
    listingMultiselectQuestions: {
      include: {
        multiselectQuestions: true,
      },
    },
    listingFeatures: true,
    listingUtilities: true,
  },
};

views.base = {
  ...views.fundamentals,
  units: {
    include: {
      unitTypes: true,
      unitAmiChartOverrides: true,
    },
  },
  unitGroups: {
    include: {
      unitTypes: true,
      unitGroupAmiLevels: {
        include: {
          amiChart: {
            include: {
              jurisdictions: true,
            },
          },
        },
      },
    },
  },
};

views.full = {
  ...views.fundamentals,
  applicationMethods: {
    include: {
      paperApplications: {
        include: {
          assets: true,
        },
      },
    },
  },
  listingsBuildingSelectionCriteriaFile: true,
  listingEvents: {
    include: {
      assets: true,
    },
  },
  listingsResult: true,
  listingsLeasingAgentAddress: true,
  listingsApplicationPickUpAddress: true,
  listingsApplicationDropOffAddress: true,
  listingsApplicationMailingAddress: true,
  requestedChangesUser: true,
  units: {
    include: {
      unitAmiChartOverrides: true,
      unitTypes: true,
      unitRentTypes: true,
      unitAccessibilityPriorityTypes: true,
      amiChart: {
        include: {
          jurisdictions: true,
          unitGroupAmiLevels: true,
        },
      },
    },
  },
  unitGroups: {
    include: {
      unitTypes: true,
      unitGroupAmiLevels: {
        include: {
          amiChart: {
            include: {
              jurisdictions: true,
            },
          },
        },
      },
    },
  },
};

views.details = {
  ...views.base,
  ...views.full,
};

const LISTING_CRON_JOB_NAME = 'LISTING_CRON_JOB';
/*
  this is the service for listings
  it handles all the backend's business logic for reading in listing(s)
*/
@Injectable()
export class ListingService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
    private httpService: HttpService,
    private afsService: ApplicationFlaggedSetService,
    private emailService: EmailService,
    private configService: ConfigService,
    @Inject(Logger)
    private logger = new Logger(ListingService.name),
    private schedulerRegistry: SchedulerRegistry,
    private permissionService: PermissionService,
  ) {}

  onModuleInit() {
    startCronJob(
      this.prisma,
      LISTING_CRON_JOB_NAME,
      process.env.LISTING_PROCESSING_CRON_STRING,
      this.closeListings.bind(this),
      this.logger,
      this.schedulerRegistry,
    );
  }

  /*
    this will get a set of listings given the params passed in
    this set can either be paginated or not depending on the params
    it will return both the set of listings, and some meta information to help with pagination
  */
  async list(params: ListingsQueryBody | ListingsQueryParams): Promise<{
    items: Listing[];
    meta: {
      currentPage: number;
      itemCount: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const whereClause = this.buildWhereClause(params.filter, params.search);
    const count = await this.prisma.listings.count({
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

    const listingsRaw = await this.prisma.listings.findMany({
      skip: calculateSkip(params.limit, page),
      take: calculateTake(params.limit),
      orderBy: buildOrderByForListings(params.orderBy, params.orderDir),
      include: views[params.view ?? 'full'],
      where: whereClause,
    });

    const listings = mapTo(Listing, listingsRaw);

    listings.forEach((listing) => {
      if (Array.isArray(listing.units) && listing.units.length > 0) {
        listing.unitsSummarized = {
          byUnitTypeAndRent: summarizeUnitsByTypeAndRent(
            listing.units,
            listing,
          ),
        };
      }
    });

    const paginationInfo = buildPaginationMetaInfo(
      params,
      count,
      listings.length,
    );

    return {
      items: listings,
      meta: paginationInfo,
    };
  }

  public async getUserEmailInfo(
    userRoles: UserRoleEnum | UserRoleEnum[],
    listingId?: string,
    jurisId?: string,
    getPublicUrl = false,
  ): Promise<{ emails: string[]; publicUrl?: string | null }> {
    // determine where clause(s)
    const userRolesWhere: Prisma.UserAccountsWhereInput[] = [];
    if (userRoles.includes(UserRoleEnum.admin))
      userRolesWhere.push({ userRoles: { isAdmin: true } });
    if (userRoles.includes(UserRoleEnum.partner))
      userRolesWhere.push({
        userRoles: { isPartner: true },
        listings: { some: { id: listingId } },
      });
    if (userRoles.includes(UserRoleEnum.jurisdictionAdmin)) {
      userRolesWhere.push({
        userRoles: { isJurisdictionalAdmin: true },
        jurisdictions: { some: { id: jurisId } },
      });
    }

    const userResults = await this.prisma.userAccounts.findMany({
      include: {
        jurisdictions: {
          select: {
            id: true,
            publicUrl: getPublicUrl,
          },
        },
      },
      where: {
        OR: userRolesWhere,
      },
    });

    // account for users having access to multiple jurisdictions
    const publicUrl = getPublicUrl
      ? userResults[0]?.jurisdictions?.find((juris) => juris.id === jurisId)
          ?.publicUrl
      : null;
    const userEmails: string[] = [];
    userResults?.forEach((user) => user?.email && userEmails.push(user.email));
    return { emails: userEmails, publicUrl };
  }

  public async listingApprovalNotify(params: {
    user: User;
    listingInfo: IdDTO;
    status: ListingsStatusEnum;
    approvingRoles: UserRoleEnum[];
    previousStatus?: ListingsStatusEnum;
    jurisId: string;
  }) {
    const nonApprovingRoles: UserRoleEnum[] = [UserRoleEnum.partner];
    if (!params.approvingRoles.includes(UserRoleEnum.jurisdictionAdmin))
      nonApprovingRoles.push(UserRoleEnum.jurisdictionAdmin);
    if (
      params.status === ListingsStatusEnum.pendingReview &&
      params.previousStatus !== ListingsStatusEnum.pendingReview
    ) {
      const userInfo = await this.getUserEmailInfo(
        params.approvingRoles,
        params.listingInfo.id,
        params.jurisId,
      );
      await this.emailService.requestApproval(
        { id: params.jurisId },
        { id: params.listingInfo.id, name: params.listingInfo.name },
        userInfo.emails,
        this.configService.get('PARTNERS_PORTAL_URL'),
      );
    }
    // admin updates status to changes requested when approval requires partner changes
    else if (
      params.status === ListingsStatusEnum.changesRequested &&
      params.previousStatus !== ListingsStatusEnum.changesRequested
    ) {
      const userInfo = await this.getUserEmailInfo(
        nonApprovingRoles,
        params.listingInfo.id,
        params.jurisId,
      );
      await this.emailService.changesRequested(
        params.user,
        {
          id: params.listingInfo.id,
          name: params.listingInfo.name,
          juris: params.jurisId,
        },
        userInfo.emails,
        this.configService.get('PARTNERS_PORTAL_URL'),
      );
    }
    // check if status of active requires notification
    else if (params.status === ListingsStatusEnum.active) {
      // if newly published listing, notify non-approving users with access
      if (
        params.previousStatus === ListingsStatusEnum.pendingReview ||
        params.previousStatus === ListingsStatusEnum.changesRequested ||
        params.previousStatus === ListingsStatusEnum.pending
      ) {
        const userInfo = await this.getUserEmailInfo(
          nonApprovingRoles,
          params.listingInfo.id,
          params.jurisId,
          true,
        );
        await this.emailService.listingApproved(
          { id: params.jurisId },
          { id: params.listingInfo.id, name: params.listingInfo.name },
          userInfo.emails,
          userInfo.publicUrl,
        );
      }
    }
  }

  /*
    this helps build the where clause for the list()
  */
  buildWhereClause(
    params?: ListingFilterParams[],
    search?: string,
  ): Prisma.ListingsWhereInput {
    const filters: Prisma.ListingsWhereInput[] = [];

    if (params?.length) {
      params.forEach((filter) => {
        // TODO: handling availibility for units and unitGroups
        // if (
        //   filter[ListingFilterKeys.availability] ===
        //   FilterAvailabilityEnum.waitlistOpen
        // ) {
        //   const builtFilter = buildFilter({
        //     $comparison: filter.$comparison,
        //     $include_nulls: false,
        //     value: ReviewOrderTypeEnum.waitlist,
        //     key: 'reviewOrderType',
        //   });
        //   filters.push({
        //     OR: builtFilter.map((filt) => ({
        //       reviewOrderType: filt,
        //     })),
        //   });
        // } else if (
        //   filter[ListingFilterKeys.availability] ===
        //   FilterAvailabilityEnum.unitsAvailable
        // ) {
        //   const builtFilter = buildFilter({
        //     $comparison: Compare['>='],
        //     $include_nulls: false,
        //     value: 1,
        //     key: 'reviewOrderType',
        //   });
        //   filters.push({
        //     OR: builtFilter.map((filt) => ({
        //       reviewOrderType: filt,
        //     })),
        //   });
        // }
        if (filter[ListingFilterKeys.bathrooms]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.bathrooms],
            key: ListingFilterKeys.bathrooms,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              units: {
                some: {
                  numBathrooms: filt,
                },
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.bedrooms]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.bedrooms],
            key: ListingFilterKeys.bedrooms,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              units: {
                some: {
                  numBedrooms: filt,
                },
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.city]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.city],
            key: ListingFilterKeys.city,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              listingsBuildingAddress: {
                city: filt,
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.counties]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.counties],
            key: ListingFilterKeys.counties,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              listingsBuildingAddress: {
                county: filt,
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.homeTypes]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.homeTypes],
            key: ListingFilterKeys.homeTypes,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              homeType: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.ids]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.ids],
            key: ListingFilterKeys.ids,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              id: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.isVerified] !== undefined) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.isVerified],
            key: ListingFilterKeys.isVerified,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              [ListingFilterKeys.isVerified]: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.jurisdiction]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.jurisdiction],
            key: ListingFilterKeys.jurisdiction,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              jurisdictionId: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.leasingAgent]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.leasingAgent],
            key: ListingFilterKeys.leasingAgent,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              userAccounts: {
                some: {
                  id: filt,
                },
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.listingFeatures]) {
          filters.push({
            OR: filter[ListingFilterKeys.listingFeatures].map((feature) => ({
              listingFeatures: {
                [feature]: true,
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.monthlyRent]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.monthlyRent],
            key: ListingFilterKeys.monthlyRent,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              units: {
                some: {
                  [ListingFilterKeys.monthlyRent]: filt,
                },
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.name]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.name],
            key: ListingFilterKeys.name,
            caseSensitive: false,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({ [ListingFilterKeys.name]: filt })),
          });
        }
        if (filter[ListingFilterKeys.neighborhood]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.neighborhood],
            key: ListingFilterKeys.neighborhood,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              [ListingFilterKeys.neighborhood]: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.regions]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.regions],
            key: ListingFilterKeys.regions,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              region: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.reservedCommunityTypes]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.reservedCommunityTypes],
            key: ListingFilterKeys.reservedCommunityTypes,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              [ListingFilterKeys.reservedCommunityTypes]: {
                name: filt,
              },
            })),
          });
        }
        if (filter[ListingFilterKeys.section8Acceptance] !== undefined) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.section8Acceptance],
            key: ListingFilterKeys.section8Acceptance,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              [ListingFilterKeys.section8Acceptance]: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.status]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.status],
            key: ListingFilterKeys.status,
            caseSensitive: true,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              [ListingFilterKeys.status]: filt,
            })),
          });
        }
        if (filter[ListingFilterKeys.zipCode]) {
          const builtFilter = buildFilter({
            $comparison: filter.$comparison,
            $include_nulls: false,
            value: filter[ListingFilterKeys.zipCode],
            key: ListingFilterKeys.zipCode,
          });
          filters.push({
            OR: builtFilter.map((filt) => ({
              listingsBuildingAddress: {
                [ListingFilterKeys.zipCode]: filt,
              },
            })),
          });
        }
      });
    }

    if (search) {
      filters.push({
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      });
    }

    return {
      AND: filters,
    };
  }

  /*
    this will return 1 listing or error
    the scope of data it returns is dependent on the view arg passed in
  */
  async findOne(
    listingId: string,
    lang: LanguagesEnum = LanguagesEnum.en,
    view: ListingViews = ListingViews.full,
    enableUnitGroups = false,
  ): Promise<Listing> {
    const listingRaw = await this.findOrThrow(
      listingId,
      view,
      enableUnitGroups,
    );

    let result = mapTo(Listing, listingRaw);

    if (lang !== LanguagesEnum.en) {
      result = await this.translationService.translateListing(result, lang);
    }

    await this.addUnitsSummarized(result);
    return result;
  }

  /**
   *
   * @param listingId id for the listing we are querying for
   * @param lang language that the translated listing should come back as
   * @param view the form the listing should come back as (what data is returned)
   * @returns an externalized version of the listing as a json object
   */
  async findOneAndExternalize(
    listingId: string,
    lang: LanguagesEnum = LanguagesEnum.en,
    view: ListingViews = ListingViews.full,
  ): Promise<string> {
    const listing: any = await this.findOne(listingId, lang, view);
    if (!listing) {
      return '';
    }

    if (listing.applicationMethods) {
      listing.applicationMethods.forEach((applicationMethod) => {
        if (applicationMethod?.paperApplications) {
          applicationMethod.paperApplications.forEach((paperApp) => {
            paperApp.file = paperApp.assets;
          });
        }
      });
    }
    if (listing.referralApplication) {
      if (listing?.referralApplication.paperApplications) {
        listing?.referralApplication.paperApplications.forEach((paperApp) => {
          paperApp.file = paperApp.assets;
        });
      }
    }
    if (listing.listingsResult) {
      listing.result = listing.listingsResult;
    }
    if (listing.listingsBuildingSelectionCriteriaFile) {
      listing.buildingSelectionCriteriaFile =
        listing.listingsBuildingSelectionCriteriaFile;
    }
    if (listing.listingsBuildingAddress) {
      listing.buildingAddress = listing.listingsBuildingAddress;
    }
    if (listing.listingsApplicationPickUpAddress) {
      listing.applicationPickUpAddress =
        listing.listingsApplicationPickUpAddress;
    }
    if (listing.listingsApplicationDropOffAddress) {
      listing.applicationDropOffAddress =
        listing.listingsApplicationDropOffAddress;
    }
    if (listing.listingsApplicationMailingAddress) {
      listing.applicationMailingAddress =
        listing.listingsApplicationMailingAddress;
    }
    if (listing.listingsLeasingAgentAddress) {
      listing.leasingAgentAddress = listing.listingsLeasingAgentAddress;
    }
    if (listing.listingUtilities) {
      listing.utilities = listing.listingUtilities;
    }
    if (listing.listingFeatures) {
      listing.features = listing.listingFeatures;
    }
    if (listing.jurisdictions) {
      listing.jurisdiction = listing.jurisdictions;
    }
    if (listing.reservedCommunityTypes) {
      listing.reservedCommunityType = listing.reservedCommunityTypes;
    }
    if (listing.listingEvents) {
      listing.listingEvents.forEach((event) => {
        if (event.assets) {
          event.file = event.assets;
        }
      });
      listing.events = listing.listingEvents;
    }
    if (listing.listingImages) {
      listing.listingImages.forEach((image) => {
        if (image.assets) {
          image.image = image.assets;
        }
      });
      listing.images = listing.listingImages;
    }
    if (listing.requestedChangesUser) {
      delete listing.requestedChangesUser;
    }
    if (listing.listingMultiselectQuestions) {
      listing.listingMultiselectQuestions.forEach(
        (listingMultiselectQuestion) => {
          listingMultiselectQuestion.multiselectQuestion =
            listingMultiselectQuestion.multiselectQuestions;
        },
      );
    }
    if (listing.units) {
      listing.units.forEach((unit) => {
        if (unit.unitTypes) {
          unit.unitType = unit.unitTypes;
        }
        if (unit.unitRentTypes) {
          unit.unitRentType = unit.unitRentTypes;
        }
        if (unit.unitAccessibilityPriorityTypes) {
          unit.priorityType = unit.unitAccessibilityPriorityTypes;
        }
        if (unit.unitAmiChartOverrides) {
          unit.amiChartOverride = unit.unitAmiChartOverrides;
        }
      });
    }
    if (listing.unitsSummary) {
      listing.unitsSummary.forEach((unitsSummary) => {
        unitsSummary.unitType = unitsSummary.unitTypes;
      });
    }
    if (listing.unitsSummarized) {
      if (listing.unitsSummarized.byUnitTypeAndRent) {
        listing.unitsSummarized.byUnitTypeAndRent.forEach((unitsSummary) => {
          unitsSummary.unitType = unitsSummary.unitTypes;
        });
      }
      if (listing.unitsSummarized.byUnitType) {
        listing.unitsSummarized.byUnitType.forEach((unitsSummary) => {
          unitsSummary.unitType = unitsSummary.unitTypes;
        });
      }
      if (listing.unitsSummarized.byAMI) {
        listing.unitsSummarized.byAMI.forEach((byAMI) => {
          if (byAMI.byUnitType) {
            byAMI.byUnitType.forEach((unitSummary) => {
              unitSummary.unitType = unitSummary.unitTypes;
            });
          }
        });
      }
    }
    // add additional jurisdiction fields for external purpose
    const jurisdiction = await this.prisma.jurisdictions.findFirst({
      where: { id: listing.jurisdictions.id },
    });
    return JSON.stringify({ ...listing, jurisdiction: jurisdiction });
  }

  /*
    creates a listing
  */
  async create(
    dto: ListingCreate,
    requestingUser: User,
    copyOfId?: string,
  ): Promise<Listing> {
    await this.permissionService.canOrThrow(
      requestingUser,
      'listing',
      permissionActions.create,
      {
        jurisdictionId: dto.jurisdictions.id,
      },
    );

    const rawJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: {
        id: dto.jurisdictions.id,
      },
      include: {
        featureFlags: true,
      },
    });

    const enableUnitGroups = rawJurisdiction?.featureFlags?.find(
      (featureFlag) => featureFlag.name === FeatureFlagEnum.enableUnitGroups,
    )?.active;

    if (
      (enableUnitGroups && dto.units?.length > 0) ||
      (!enableUnitGroups && dto.unitGroups?.length > 0)
    ) {
      throw new BadRequestException({
        message: `Cannot provide ${
          enableUnitGroups ? 'units' : 'unitGroups'
        } with enableUnitGroups flag set to ${enableUnitGroups}`,
        status: 400,
      });
    }

    //For unit groups it will return 0 (as we don't use it for it)
    dto.unitsAvailable =
      dto.reviewOrderType !== ReviewOrderTypeEnum.waitlist && dto.units
        ? dto.units.length
        : 0;

    const rawListing = await this.prisma.listings.create({
      include: views.details,
      data: {
        ...dto,
        assets: dto.assets
          ? {
              create: dto.assets.map((asset) => ({
                fileId: asset.fileId,
                label: asset.label,
              })),
            }
          : undefined,
        applicationMethods: dto.applicationMethods
          ? {
              create: dto.applicationMethods.map((applicationMethod) => ({
                ...applicationMethod,
                paperApplications: applicationMethod.paperApplications
                  ? {
                      create: applicationMethod.paperApplications.map(
                        (paperApplication) => ({
                          ...paperApplication,
                          assets: {
                            create: {
                              ...paperApplication.assets,
                            },
                          },
                        }),
                      ),
                    }
                  : undefined,
              })),
            }
          : undefined,
        listingEvents: dto.listingEvents
          ? {
              create: dto.listingEvents.map((event) => ({
                type: event.type,
                startDate: event.startDate,
                startTime: event.startTime,
                endTime: event.endTime,
                url: event.url,
                note: event.note,
                label: event.label,
                assets: event.assets
                  ? {
                      create: {
                        ...event.assets,
                      },
                    }
                  : undefined,
              })),
            }
          : undefined,
        listingImages: dto.listingImages
          ? {
              create: dto.listingImages.map((image) => ({
                assets: {
                  create: {
                    ...image.assets,
                  },
                },
                ordinal: image.ordinal,
              })),
            }
          : undefined,
        listingMultiselectQuestions: dto.listingMultiselectQuestions
          ? {
              create: dto.listingMultiselectQuestions.map(
                (multiselectQuestion) => ({
                  ordinal: multiselectQuestion.ordinal,
                  multiselectQuestions: {
                    connect: {
                      id: multiselectQuestion.id,
                    },
                  },
                }),
              ),
            }
          : undefined,
        listingsApplicationDropOffAddress: dto.listingsApplicationDropOffAddress
          ? {
              create: {
                ...dto.listingsApplicationDropOffAddress,
              },
            }
          : undefined,
        reservedCommunityTypes: dto.reservedCommunityTypes
          ? {
              connect: {
                id: dto.reservedCommunityTypes.id,
              },
            }
          : undefined,
        listingsBuildingSelectionCriteriaFile:
          dto.listingsBuildingSelectionCriteriaFile
            ? {
                create: {
                  ...dto.listingsBuildingSelectionCriteriaFile,
                },
              }
            : undefined,
        listingUtilities: dto.listingUtilities
          ? {
              create: {
                ...dto.listingUtilities,
              },
            }
          : undefined,
        listingsApplicationMailingAddress: dto.listingsApplicationMailingAddress
          ? {
              create: {
                ...dto.listingsApplicationMailingAddress,
              },
            }
          : undefined,
        listingsLeasingAgentAddress: dto.listingsLeasingAgentAddress
          ? {
              create: {
                ...dto.listingsLeasingAgentAddress,
              },
            }
          : undefined,
        listingFeatures: dto.listingFeatures
          ? {
              create: {
                ...dto.listingFeatures,
              },
            }
          : undefined,
        jurisdictions: dto.jurisdictions
          ? {
              connect: {
                id: dto.jurisdictions.id,
              },
            }
          : undefined,
        listingsApplicationPickUpAddress: dto.listingsApplicationPickUpAddress
          ? {
              create: {
                ...dto.listingsApplicationPickUpAddress,
              },
            }
          : undefined,
        listingsBuildingAddress: dto.listingsBuildingAddress
          ? {
              create: {
                ...dto.listingsBuildingAddress,
              },
            }
          : undefined,
        units: dto.units
          ? {
              create: dto.units.map((unit) => ({
                amiPercentage: unit.amiPercentage,
                annualIncomeMin: unit.annualIncomeMin,
                monthlyIncomeMin: unit.monthlyIncomeMin,
                floor: unit.floor,
                annualIncomeMax: unit.annualIncomeMax,
                maxOccupancy: unit.maxOccupancy,
                minOccupancy: unit.minOccupancy,
                monthlyRent: unit.monthlyRent,
                numBathrooms: unit.numBathrooms,
                numBedrooms: unit.numBedrooms,
                number: unit.number,
                sqFeet: unit.sqFeet,
                monthlyRentAsPercentOfIncome: unit.monthlyRentAsPercentOfIncome,
                bmrProgramChart: unit.bmrProgramChart,
                unitTypes: unit.unitTypes
                  ? {
                      connect: {
                        id: unit.unitTypes.id,
                      },
                    }
                  : undefined,
                amiChart: unit.amiChart
                  ? {
                      connect: {
                        id: unit.amiChart.id,
                      },
                    }
                  : undefined,
                unitAmiChartOverrides: unit.unitAmiChartOverrides
                  ? {
                      create: {
                        items: unit.unitAmiChartOverrides.items,
                      },
                    }
                  : undefined,
                unitAccessibilityPriorityTypes:
                  unit.unitAccessibilityPriorityTypes
                    ? {
                        connect: {
                          id: unit.unitAccessibilityPriorityTypes.id,
                        },
                      }
                    : undefined,
                unitRentTypes: unit.unitRentTypes
                  ? {
                      connect: {
                        id: unit.unitRentTypes.id,
                      },
                    }
                  : undefined,
              })),
            }
          : undefined,
        unitGroups: dto.unitGroups
          ? {
              create: dto.unitGroups.map((group) => ({
                bathroomMax: group.bathroomMax,
                bathroomMin: group.bathroomMin,
                floorMax: group.floorMax,
                floorMin: group.floorMin,
                maxOccupancy: group.maxOccupancy,
                minOccupancy: group.minOccupancy,
                openWaitlist: group.openWaitlist,
                sqFeetMax: group.sqFeetMax,
                sqFeetMin: group.sqFeetMin,
                totalAvailable: group.totalAvailable,
                totalCount: group.totalCount,
                unitGroupAmiLevels: {
                  create: group.unitGroupAmiLevels.map((level) => ({
                    amiPercentage: level.amiPercentage,
                    monthlyRentDeterminationType:
                      level.monthlyRentDeterminationType,
                    percentageOfIncomeValue: level.percentageOfIncomeValue,
                    flatRentValue: level.flatRentValue,
                    amiChart: {
                      connect: { id: level.amiChart.id },
                    },
                  })),
                },
                unitAccessibilityPriorityTypes:
                  group.unitAccessibilityPriorityTypes
                    ? {
                        connect: {
                          id: group.unitAccessibilityPriorityTypes.id,
                        },
                      }
                    : undefined,
                unitTypes: {
                  connect: group.unitTypes.map((type) => ({
                    id: type.id,
                  })),
                },
              })),
            }
          : undefined,
        unitsSummary: dto.unitsSummary
          ? {
              create: dto.unitsSummary.map((unitSummary) => ({
                ...unitSummary,
                unitTypes: unitSummary.unitTypes
                  ? {
                      connect: {
                        id: unitSummary.unitTypes.id,
                      },
                    }
                  : undefined,
                unitAccessibilityPriorityTypes:
                  unitSummary.unitAccessibilityPriorityTypes
                    ? {
                        connect: {
                          id: unitSummary.unitAccessibilityPriorityTypes.id,
                        },
                      }
                    : undefined,
              })),
            }
          : undefined,
        listingsResult: dto.listingsResult
          ? {
              create: {
                ...dto.listingsResult,
              },
            }
          : undefined,
        requestedChangesUser: undefined,
        publishedAt:
          dto.status === ListingsStatusEnum.active ? new Date() : undefined,
        contentUpdatedAt: new Date(),
        copyOf: copyOfId
          ? {
              connect: {
                id: copyOfId,
              },
            }
          : undefined,
      },
    });

    if (rawListing.status === ListingsStatusEnum.pendingReview) {
      const jurisdiction = await this.prisma.jurisdictions.findFirst({
        where: {
          id: rawListing.jurisdictions?.id,
        },
      });
      await this.listingApprovalNotify({
        user: requestingUser,
        listingInfo: { id: rawListing.id, name: rawListing.name },
        status: rawListing.status,
        approvingRoles: jurisdiction?.listingApprovalPermissions,
        jurisId: rawListing.jurisdictions.id,
      });
    }
    await this.cachePurge(undefined, dto.status, rawListing.id);
    return mapTo(Listing, rawListing);
  }

  async duplicate(
    dto: ListingDuplicate,
    requestingUser: User,
  ): Promise<Listing> {
    const storedListing = await this.findOrThrow(
      dto.storedListing.id,
      ListingViews.details,
    );
    if (dto.name.trim() === storedListing.name) {
      throw new BadRequestException('New listing name must be unique');
    }

    const duplicateListingPermissions = (
      requestingUser?.jurisdictions?.length === 1
        ? requestingUser?.jurisdictions[0]
        : requestingUser?.jurisdictions?.find(
            (juris) => juris.id === storedListing?.jurisdictions?.id,
          )
    )?.duplicateListingPermissions;

    const userRoles =
      requestingUser?.userRoles?.isAdmin ||
      (requestingUser?.userRoles?.isJurisdictionalAdmin &&
        duplicateListingPermissions?.includes(
          UserRoleEnum.jurisdictionAdmin,
        )) ||
      (requestingUser?.userRoles?.isPartner &&
        duplicateListingPermissions?.includes(UserRoleEnum.partner))
        ? {
            ...requestingUser.userRoles,
            isAdmin: true,
          }
        : {
            ...requestingUser?.userRoles,
            isAdmin: false,
          };

    await this.permissionService.canOrThrow(
      { ...requestingUser, userRoles: userRoles },
      'listing',
      permissionActions.create,
      {
        jurisdictionId: storedListing.jurisdictions.id,
      },
    );

    //manually check for juris/listing mismatch since logic above is forcing admin permissioning
    if (
      (requestingUser?.userRoles?.isJurisdictionalAdmin &&
        !requestingUser?.jurisdictions?.some(
          (juris) => juris.id === storedListing.jurisdictionId,
        )) ||
      (requestingUser?.userRoles?.isPartner &&
        !requestingUser?.listings?.some(
          (listing) => listing.id === storedListing.id,
        ))
    ) {
      throw new ForbiddenException();
    }

    const mappedListing = mapTo(ListingCreate, storedListing);

    const listingEvents = mappedListing.listingEvents?.filter(
      (event) => event.type !== ListingEventsTypeEnum.lotteryResults,
    );

    const listingImages = mappedListing.listingImages?.map((unsavedImage) => ({
      assets: {
        fileId: unsavedImage.assets.fileId,
        label: unsavedImage.assets.label,
      },
      ordinal: unsavedImage.ordinal,
    }));

    const applicationMethods = mappedListing.applicationMethods?.map(
      (applicationMethod) => ({
        ...applicationMethod,
        paperApplications: applicationMethod.paperApplications?.map(
          (paperApplication) => ({
            ...paperApplication,
            assets: {
              fileId: paperApplication.assets.fileId,
              label: paperApplication.assets.label,
            },
          }),
        ),
      }),
    );

    if (!dto.includeUnits) {
      delete mappedListing['units'];
    }

    const newListingData: ListingCreate = {
      ...mappedListing,
      applicationMethods: applicationMethods,
      assets: [],
      listingsBuildingSelectionCriteriaFile:
        mappedListing.listingsBuildingSelectionCriteriaFile
          ? {
              fileId:
                mappedListing.listingsBuildingSelectionCriteriaFile.fileId,
              label: mappedListing.listingsBuildingSelectionCriteriaFile.label,
            }
          : undefined,
      listingEvents: listingEvents,
      listingImages: listingImages,
      listingMultiselectQuestions:
        storedListing.listingMultiselectQuestions?.map((question) => ({
          id: question.multiselectQuestionId,
          ordinal: question.ordinal,
        })),
      lotteryLastRunAt: undefined,
      lotteryLastPublishedAt: undefined,
      lotteryStatus: undefined,
      name: dto.name,
      status: ListingsStatusEnum.pending,
    };

    const res = await this.create(
      newListingData,
      {
        ...requestingUser,
        userRoles: userRoles,
      },
      storedListing.id,
    );

    if (
      requestingUser?.userRoles?.isPartner &&
      duplicateListingPermissions?.includes(UserRoleEnum.partner)
    ) {
      await this.prisma.userAccounts.update({
        data: {
          listings: {
            connect: { id: res.id },
          },
        },
        where: {
          id: requestingUser.id,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          module: 'user',
          recordId: requestingUser.id,
          action: 'update',
          userAccounts: { connect: { id: requestingUser.id } },
        },
      });
    }

    return res;
  }

  /*
    deletes a listing
  */
  async delete(id: string, requestingUser: User): Promise<SuccessDTO> {
    const storedListing = await this.findOrThrow(id);

    await this.permissionService.canOrThrow(
      requestingUser,
      'listing',
      permissionActions.delete,
      {
        id: storedListing.id,
        jurisdictionId: storedListing.jurisdictionId,
      },
    );

    await this.prisma.listings.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    } as SuccessDTO;
  }

  /*
    This will either find a listing or throw an error
    a listing view can be provided which will add the joins to produce that view correctly
  */
  async findOrThrow(
    id: string,
    view?: ListingViews,
    enableUnitGroups?: boolean,
  ) {
    const viewInclude = view ? views[view] : undefined;
    if (enableUnitGroups && viewInclude) {
      viewInclude.units = undefined;
      viewInclude.unitGroups = {
        include: {
          unitTypes: true,
          unitGroupAmiLevels: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                },
              },
            },
          },
        },
      };
    }

    const listing = await this.prisma.listings.findUnique({
      include: viewInclude,
      where: {
        id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        `listingId ${id} was requested but not found`,
      );
    }
    return listing;
  }

  /*
    This should be run for all address fields on an update of a listing.
    The address either needs to be updated if fields are changed, deleted if no longer attached,
    or created if it is a new address
  */
  async addressUpdate(
    existingListing,
    newListing: ListingUpdate,
    field: string,
  ) {
    if (existingListing[field]) {
      if (newListing[field]) {
        return await this.prisma.address.update({
          data: {
            ...newListing[field],
          },
          where: {
            id: existingListing[field].id,
          },
        });
      } else {
        // in order to delete the old address we first need to disconnect it from the listing
        await this.prisma.listings.update({
          data: {
            [field]: {
              disconnect: {
                id: existingListing[field].id,
              },
            },
          },
          where: {
            id: existingListing.id,
          },
        });
        await this.prisma.address.delete({
          where: {
            id: existingListing[field].id,
          },
        });
      }
    } else if (newListing[field]) {
      return await this.prisma.address.create({
        data: {
          ...newListing[field],
        },
      });
    }
    return undefined;
  }

  /**
   * @param listingId the listing id we are operating on
   * @description disconnects assets from listing events, then deletes those assets
   */
  async updateListingEvents(listingId: string): Promise<void> {
    const assetIds = await this.prisma.listingEvents.findMany({
      select: {
        id: true,
        fileId: true,
      },
      where: {
        listingId,
      },
    });
    await Promise.all(
      assetIds.map(async (assetData) => {
        await this.prisma.listingEvents.update({
          data: {
            assets: {
              disconnect: true,
            },
          },
          where: {
            id: assetData.id,
          },
        });
      }),
    );
    const fileIds = assetIds.reduce((accum, curr) => {
      if (curr.fileId) {
        accum.push(curr.fileId);
      }
      return accum;
    }, []);
    if (fileIds.length) {
      await this.prisma.assets.deleteMany({
        where: {
          id: {
            in: fileIds,
          },
        },
      });
    }
  }

  /*
    update a listing
  */
  async update(dto: ListingUpdate, requestingUser: User): Promise<Listing> {
    const storedListing = await this.findOrThrow(dto.id, ListingViews.details);

    await this.permissionService.canOrThrow(
      requestingUser,
      'listing',
      permissionActions.update,
      {
        id: storedListing.id,
        jurisdictionId: storedListing.jurisdictionId,
      },
    );

    const rawJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: {
        id: dto.jurisdictions.id,
      },
      include: {
        featureFlags: true,
      },
    });

    const enableUnitGroups = rawJurisdiction?.featureFlags?.find(
      (featureFlag) => featureFlag.name === FeatureFlagEnum.enableUnitGroups,
    )?.active;

    if (
      (enableUnitGroups && dto.units?.length > 0) ||
      (!enableUnitGroups && dto.unitGroups?.length > 0)
    ) {
      throw new BadRequestException({
        message: `Cannot provide ${
          enableUnitGroups ? 'units' : 'unitGroups'
        } with enableUnitGroups flag set to ${enableUnitGroups}`,
        status: 400,
      });
    }

    //For unit groups it will return 0 (as we don't use it for it)
    dto.unitsAvailable =
      dto.reviewOrderType !== ReviewOrderTypeEnum.waitlist && dto.units
        ? dto.units.length
        : 0;

    // We need to save the assets before saving it to the listing_images table
    let allAssets = [];
    const unsavedImages = dto.listingImages?.reduce((values, value) => {
      if (!value.assets.id) {
        values.push(value);
      } else {
        allAssets.push(value);
      }
      return values;
    }, []);

    if (unsavedImages?.length) {
      const assetCreates = unsavedImages.map((unsavedImage) => {
        return this.prisma.assets.create({
          data: unsavedImage.assets,
        });
      });
      const uploadedImages = await Promise.all(assetCreates);
      allAssets = [
        ...allAssets,
        ...uploadedImages.map((image, index) => {
          return { assets: image, ordinal: unsavedImages[index].ordinal };
        }),
      ];
    }

    const pickUpAddress = await this.addressUpdate(
      storedListing,
      dto,
      'listingsApplicationPickUpAddress',
    );
    const mailAddress = await this.addressUpdate(
      storedListing,
      dto,
      'listingsApplicationMailingAddress',
    );
    const dropOffAddress = await this.addressUpdate(
      storedListing,
      dto,
      'listingsApplicationDropOffAddress',
    );
    const leasingAgentAddress = await this.addressUpdate(
      storedListing,
      dto,
      'listingsLeasingAgentAddress',
    );
    const buildingAddress = await this.addressUpdate(
      storedListing,
      dto,
      'listingsBuildingAddress',
    );
    // Delete all assets tied to listing events before creating new ones
    await this.updateListingEvents(dto.id);

    // Wrap the deletion and update in one transaction so that units aren't lost if update fails
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transactions = await this.prisma.$transaction([
      // delete units and unitGroups with unitGroupAmiLevels
      // technically there should be either units or unitGroups, not both
      this.prisma.unitGroupAmiLevels.deleteMany({
        where: {
          unitGroup: {
            listingId: storedListing.id,
          },
        },
      }),
      this.prisma.unitGroup.deleteMany({
        where: {
          listingId: storedListing.id,
        },
      }),
      this.prisma.units.deleteMany({
        where: {
          listingId: storedListing.id,
        },
      }),
      // Delete all listing images before creating new ones
      this.prisma.listingImages.deleteMany({
        where: {
          listingId: dto.id,
        },
      }),
      // Delete all listing events before creating new ones
      this.prisma.listingEvents.deleteMany({
        where: {
          listingId: dto.id,
        },
      }),
      // Delete all paper applications and methods before creating new ones
      this.prisma.paperApplications.deleteMany({
        where: {
          applicationMethods: {
            is: {
              listingId: dto.id,
            },
          },
        },
      }),
      this.prisma.applicationMethods.deleteMany({
        where: {
          listingId: dto.id,
        },
      }),
      this.prisma.listingMultiselectQuestions.deleteMany({
        where: {
          listingId: dto.id,
        },
      }),
      this.prisma.listings.update({
        data: {
          ...dto,
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          assets: dto.assets as unknown as Prisma.InputJsonArray,
          applicationMethods: dto.applicationMethods
            ? {
                create: dto.applicationMethods.map((applicationMethod) => ({
                  ...applicationMethod,
                  paperApplications: applicationMethod.paperApplications
                    ? {
                        create: applicationMethod.paperApplications.map(
                          (paperApplication) => ({
                            ...paperApplication,
                            assets: {
                              create: {
                                ...paperApplication.assets,
                                id: undefined,
                              },
                            },
                          }),
                        ),
                      }
                    : undefined,
                })),
              }
            : undefined,
          listingEvents: dto.listingEvents
            ? {
                create: dto.listingEvents.map((event) => ({
                  type: event.type,
                  startDate: event.startDate,
                  startTime: event.startTime,
                  endTime: event.endTime,
                  url: event.url,
                  note: event.note,
                  label: event.label,
                  assets: event.assets
                    ? {
                        create: {
                          ...event.assets,
                          id: undefined,
                        },
                      }
                    : undefined,
                })),
              }
            : undefined,
          listingImages: allAssets.length
            ? {
                create: allAssets.map((asset) => {
                  return {
                    ordinal: asset.ordinal,
                    assets: {
                      connect: {
                        id: asset.assets.id,
                      },
                    },
                  };
                }),
              }
            : undefined,
          listingMultiselectQuestions: dto.listingMultiselectQuestions
            ? {
                create: dto.listingMultiselectQuestions.map(
                  (multiselectQuestion) => ({
                    ordinal: multiselectQuestion.ordinal,
                    multiselectQuestionId: multiselectQuestion.id,
                  }),
                ),
              }
            : undefined,
          listingsApplicationDropOffAddress: dropOffAddress
            ? {
                connect: {
                  id: dropOffAddress.id,
                },
              }
            : undefined,
          reservedCommunityTypes: dto.reservedCommunityTypes
            ? {
                connect: {
                  id: dto.reservedCommunityTypes.id,
                },
              }
            : storedListing.reservedCommunityTypes
            ? {
                disconnect: {
                  id: storedListing.reservedCommunityTypes.id,
                },
              }
            : undefined,
          // Three options for the building selection criteria file
          // create new one, connect existing one, or deleted (disconnect)
          listingsBuildingSelectionCriteriaFile:
            dto.listingsBuildingSelectionCriteriaFile
              ? dto.listingsBuildingSelectionCriteriaFile.id
                ? {
                    connectOrCreate: {
                      where: {
                        id: dto.listingsBuildingSelectionCriteriaFile.id,
                      },
                      create: {
                        ...dto.listingsBuildingSelectionCriteriaFile,
                      },
                    },
                  }
                : {
                    create: {
                      ...dto.listingsBuildingSelectionCriteriaFile,
                    },
                  }
              : {
                  disconnect: true,
                },
          listingUtilities: dto.listingUtilities
            ? {
                create: {
                  ...dto.listingUtilities,
                },
              }
            : undefined,
          listingsApplicationMailingAddress: mailAddress
            ? {
                connect: {
                  id: mailAddress.id,
                },
              }
            : undefined,
          listingsLeasingAgentAddress: leasingAgentAddress
            ? {
                connect: {
                  id: leasingAgentAddress.id,
                },
              }
            : undefined,
          listingFeatures: dto.listingFeatures
            ? {
                create: {
                  ...dto.listingFeatures,
                },
              }
            : undefined,
          jurisdictions: dto.jurisdictions
            ? {
                connect: {
                  id: dto.jurisdictions.id,
                },
              }
            : undefined,
          listingsApplicationPickUpAddress: pickUpAddress
            ? {
                connect: {
                  id: pickUpAddress.id,
                },
              }
            : undefined,
          listingsBuildingAddress: buildingAddress
            ? {
                connect: {
                  id: buildingAddress.id,
                },
              }
            : undefined,
          units: dto.units
            ? {
                create: dto.units.map((unit) => ({
                  amiPercentage: unit.amiPercentage,
                  annualIncomeMin: unit.annualIncomeMin,
                  monthlyIncomeMin: unit.monthlyIncomeMin,
                  floor: unit.floor,
                  annualIncomeMax: unit.annualIncomeMax,
                  maxOccupancy: unit.maxOccupancy,
                  minOccupancy: unit.minOccupancy,
                  monthlyRent: unit.monthlyRent,
                  numBathrooms: unit.numBathrooms,
                  numBedrooms: unit.numBedrooms,
                  number: unit.number,
                  sqFeet: unit.sqFeet,
                  monthlyRentAsPercentOfIncome:
                    unit.monthlyRentAsPercentOfIncome,
                  bmrProgramChart: unit.bmrProgramChart,
                  unitTypes: unit.unitTypes
                    ? {
                        connect: {
                          id: unit.unitTypes.id,
                        },
                      }
                    : undefined,
                  amiChart: unit.amiChart
                    ? {
                        connect: {
                          id: unit.amiChart.id,
                        },
                      }
                    : undefined,
                  unitAmiChartOverrides: unit.unitAmiChartOverrides
                    ? {
                        create: {
                          items: unit.unitAmiChartOverrides.items,
                        },
                      }
                    : undefined,
                  unitAccessibilityPriorityTypes:
                    unit.unitAccessibilityPriorityTypes
                      ? {
                          connect: {
                            id: unit.unitAccessibilityPriorityTypes.id,
                          },
                        }
                      : undefined,
                  unitRentTypes: unit.unitRentTypes
                    ? {
                        connect: {
                          id: unit.unitRentTypes.id,
                        },
                      }
                    : undefined,
                })),
              }
            : undefined,
          unitGroups: dto.unitGroups
            ? {
                create: dto.unitGroups.map((group) => ({
                  bathroomMax: group.bathroomMax,
                  bathroomMin: group.bathroomMin,
                  floorMax: group.floorMax,
                  floorMin: group.floorMin,
                  maxOccupancy: group.maxOccupancy,
                  minOccupancy: group.minOccupancy,
                  openWaitlist: group.openWaitlist,
                  sqFeetMin: group.sqFeetMin,
                  sqFeetMax: group.sqFeetMax,
                  totalCount: group.totalCount,
                  totalAvailable: group.totalAvailable,
                  unitTypes: group.unitTypes
                    ? {
                        connect: group.unitTypes.map((type) => ({
                          id: type.id,
                        })),
                      }
                    : undefined,
                  unitGroupAmiLevels: group.unitGroupAmiLevels
                    ? {
                        create: group.unitGroupAmiLevels.map((level) => ({
                          amiPercentage: level.amiPercentage,
                          flatRentValue: level.flatRentValue,
                          monthlyRentDeterminationType:
                            level.monthlyRentDeterminationType,
                          percentageOfIncomeValue:
                            level.percentageOfIncomeValue,
                          amiChart: {
                            connect: { id: level.amiChart.id },
                          },
                        })),
                      }
                    : undefined,
                  unitAccessibilityPriorityTypes:
                    group.unitAccessibilityPriorityTypes
                      ? {
                          connect: {
                            id: group.unitAccessibilityPriorityTypes.id,
                          },
                        }
                      : undefined,
                })),
              }
            : undefined,
          unitsSummary: dto.unitsSummary
            ? {
                create: dto.unitsSummary.map((unitSummary) => ({
                  ...unitSummary,
                  unitTypes: unitSummary.unitTypes
                    ? {
                        connect: {
                          id: unitSummary.unitTypes.id,
                        },
                      }
                    : undefined,
                  unitAccessibilityPriorityTypes:
                    unitSummary.unitAccessibilityPriorityTypes
                      ? {
                          connect: {
                            id: unitSummary.unitAccessibilityPriorityTypes.id,
                          },
                        }
                      : undefined,
                })),
              }
            : undefined,
          contentUpdatedAt: new Date(),
          publishedAt:
            storedListing.status !== ListingsStatusEnum.active &&
            dto.status === ListingsStatusEnum.active
              ? new Date()
              : storedListing.publishedAt,
          closedAt:
            storedListing.status !== ListingsStatusEnum.closed &&
            dto.status === ListingsStatusEnum.closed
              ? new Date()
              : storedListing.closedAt,
          requestedChangesUser:
            dto.status === ListingsStatusEnum.changesRequested &&
            storedListing.status !== ListingsStatusEnum.changesRequested
              ? {
                  connect: {
                    id: requestingUser.id,
                  },
                }
              : undefined,
          listingsResult: dto.listingsResult
            ? {
                create: {
                  ...dto.listingsResult,
                },
              }
            : undefined,
        },
        include: views.details,
        where: {
          id: dto.id,
        },
      }),
    ]);

    const rawListing = transactions[
      transactions.length - 1
    ] as unknown as Listing;

    if (!rawListing) {
      throw new HttpException('listing failed to save', 500);
    }
    const listingApprovalPermissions = (
      await this.prisma.jurisdictions.findFirst({
        where: { id: dto.jurisdictions.id },
      })
    )?.listingApprovalPermissions;

    if (listingApprovalPermissions?.length > 0)
      await this.listingApprovalNotify({
        user: requestingUser,
        listingInfo: { id: dto.id, name: dto.name },
        approvingRoles: listingApprovalPermissions,
        status: dto.status,
        previousStatus: storedListing.status,
        jurisId: dto.jurisdictions.id,
      });

    // if listing is closed for the first time the application flag set job needs to run
    if (
      storedListing.status === ListingsStatusEnum.active &&
      dto.status === ListingsStatusEnum.closed
    ) {
      if (
        process.env.DUPLICATES_CLOSE_DATE &&
        dayjs(process.env.DUPLICATES_CLOSE_DATE, 'YYYY-MM-DD HH:mm Z') <
          dayjs(new Date())
      ) {
        await this.afsService.processDuplicates(dto.id);
      } else {
        await this.afsService.process(dto.id);
      }
    }

    await this.cachePurge(storedListing.status, dto.status, rawListing.id);

    return mapTo(Listing, rawListing);
  }

  /**
    clears the listing cache of either 1 listing or all listings
     @param storedListingStatus the status that was stored for the listing
     @param incomingListingStatus the incoming "new" status for a listing
     @param savedResponseId the id of the listing   
  */
  async cachePurge(
    storedListingStatus: ListingsStatusEnum | undefined,
    incomingListingStatus: ListingsStatusEnum,
    savedResponseId: string,
  ): Promise<void> {
    if (!process.env.PROXY_URL) {
      return;
    }
    const shouldPurgeAllListings =
      incomingListingStatus !== ListingsStatusEnum.pending ||
      storedListingStatus === ListingsStatusEnum.active;
    await firstValueFrom(
      this.httpService.request({
        baseURL: process.env.PROXY_URL,
        method: 'PURGE',
        url: `/listings/${savedResponseId}*`,
      }),
      undefined,
    ).catch((e) =>
      console.error(`purge listing ${savedResponseId} error = `, e),
    );

    if (shouldPurgeAllListings) {
      await firstValueFrom(
        this.httpService.request({
          baseURL: process.env.PROXY_URL,
          method: 'PURGE',
          url: '/listings?*',
        }),
        undefined,
      ).catch((e) => console.error('purge all listings error = ', e));
    }
  }

  /*
    this builds the units summarized for the list()
  */
  addUnitsSummarized = async (listing: Listing) => {
    if (Array.isArray(listing.units) && listing.units.length > 0) {
      const amiChartsRaw = await this.prisma.amiChart.findMany({
        where: {
          id: {
            in: listing.units.map((unit) => unit.amiChart?.id),
          },
        },
      });
      const amiCharts = mapTo(AmiChart, amiChartsRaw);
      listing.unitsSummarized = summarizeUnits(listing, amiCharts);
    }
    return listing;
  };

  /*
    returns id, name of listing given a multiselect question id
  */
  findListingsWithMultiSelectQuestion = async (
    multiselectQuestionId: string,
  ) => {
    const listingsRaw = await this.prisma.listings.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        listingMultiselectQuestions: {
          some: {
            multiselectQuestionId: multiselectQuestionId,
          },
        },
      },
    });
    return mapTo(Listing, listingsRaw);
  };

  /**
    runs the job to auto close listings that are passed their due date
    will call the the cache purge to purge all listings as long as updates had to be made
  */
  async closeListings(): Promise<SuccessDTO> {
    this.logger.warn('changeOverdueListingsStatusCron job running');
    await this.markCronJobAsStarted(LISTING_CRON_JOB_NAME);

    const listings = await this.prisma.listings.findMany({
      select: {
        id: true,
      },
      where: {
        status: ListingsStatusEnum.active,
        AND: [
          {
            applicationDueDate: {
              not: null,
            },
          },
          {
            applicationDueDate: {
              lte: new Date(),
            },
          },
        ],
      },
    });
    const listingIds = listings.map((listing) => listing.id);

    const res = await this.prisma.listings.updateMany({
      data: {
        status: ListingsStatusEnum.closed,
        closedAt: new Date(),
      },
      where: {
        id: { in: listingIds },
      },
    });

    const activityLogData = listingIds.map((id) => {
      return {
        module: 'listing',
        recordId: id,
        action: 'update',
        metadata: { status: 'closed' },
      };
    });
    await this.prisma.activityLog.createMany({
      data: activityLogData,
    });

    this.logger.warn(`Changed the status of ${res?.count} listings`);
    if (res?.count) {
      await this.cachePurge(
        ListingsStatusEnum.closed,
        ListingsStatusEnum.active,
        '',
      );
    }

    return {
      success: true,
    };
  }

  /**
    marks the db record for this cronjob as begun or creates a cronjob that
    is marked as begun if one does not already exist 
  */
  async markCronJobAsStarted(cronJobName: string): Promise<void> {
    const job = await this.prisma.cronJob.findFirst({
      where: {
        name: cronJobName,
      },
    });
    if (job) {
      // if a job exists then we update db entry
      await this.prisma.cronJob.update({
        data: {
          lastRunDate: new Date(),
        },
        where: {
          id: job.id,
        },
      });
    } else {
      // if no job we create a new entry
      await this.prisma.cronJob.create({
        data: {
          lastRunDate: new Date(),
          name: cronJobName,
        },
      });
    }
  }

  /**
   *
   * @param listingId
   * @returns the jurisdiction ID assigned to a listing
   */
  public async getJurisdictionIdByListingId(
    listingId: string,
  ): Promise<string> {
    const listing = await this.prisma.listings.findUnique({
      select: {
        jurisdictionId: true,
      },
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        `No jurisdiction for listing ${listingId} found`,
      );
    }

    return listing.jurisdictionId;
  }

  async mapMarkers(): Promise<ListingMapMarker[]> {
    const listingsRaw = await this.prisma.listings.findMany({
      select: {
        id: true,
        listingsBuildingAddress: true,
      },
      where: {
        status: ListingsStatusEnum.active,
      },
    });

    const listings = mapTo(Listing, listingsRaw);

    return listings.map((listing) => {
      return {
        id: listing.id,
        lat: listing.listingsBuildingAddress.latitude,
        lng: listing.listingsBuildingAddress.longitude,
      } as ListingMapMarker;
    });
  }
}
