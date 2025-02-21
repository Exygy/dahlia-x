import { Test, TestingModule } from '@nestjs/testing';
import {
  ApplicationAddressTypeEnum,
  ApplicationMethodsTypeEnum,
  HomeTypeEnum,
  LanguagesEnum,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  RegionEnum,
  ReviewOrderTypeEnum,
  UnitTypeEnum,
  UserRoleEnum,
} from '@prisma/client';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { PrismaService } from '../../../src/services/prisma.service';
import { ListingService } from '../../../src/services/listing.service';
import { ListingsQueryParams } from '../../../src/dtos/listings/listings-query-params.dto';
import { ListingOrderByKeys } from '../../../src/enums/listings/order-by-enum';
import { OrderByEnum } from '../../../src/enums/shared/order-by-enum';
import { ListingFilterKeys } from '../../../src/enums/listings/filter-key-enum';
import { Compare } from '../../../src/dtos/shared/base-filter.dto';
import { ListingFilterParams } from '../../../src/dtos/listings/listings-filter-params.dto';
import { Unit } from '../../../src/dtos/units/unit.dto';
import { UnitTypeSort } from '../../../src/utilities/unit-utilities';
import { Listing } from '../../../src/dtos/listings/listing.dto';
import { ListingViews } from '../../../src/enums/listings/view-enum';
import { TranslationService } from '../../../src/services/translation.service';
import { GoogleTranslateService } from '../../../src/services/google-translate.service';
import { ListingCreate } from '../../../src/dtos/listings/listing-create.dto';
import { ListingUpdate } from '../../../src/dtos/listings/listing-update.dto';
import { ListingPublishedCreate } from '../../../src/dtos/listings/listing-published-create.dto';
import { ListingPublishedUpdate } from '../../../src/dtos/listings/listing-published-update.dto';
import { ApplicationFlaggedSetService } from '../../../src/services/application-flagged-set.service';
import { User } from '../../../src/dtos/users/user.dto';
import { EmailService } from '../../../src/services/email.service';
import { PermissionService } from '../../../src/services/permission.service';
import { permissionActions } from '../../../src/enums/permissions/permission-actions-enum';
import { ApplicationService } from '../../../src/services/application.service';
import { GeocodingService } from '../../../src/services/geocoding.service';

/*
  generates a super simple mock listing for us to test logic with
*/
const mockListing = (
  pos: number,
  genUnits?: { numberToMake: number; date: Date },
) => {
  const toReturn = { id: pos, name: `listing ${pos + 1}`, units: undefined };
  if (genUnits) {
    const units: Unit[] = [];
    const { numberToMake, date } = genUnits;
    for (let i = 0; i < numberToMake; i++) {
      units.push({
        id: `unit ${i}`,
        createdAt: date,
        updatedAt: date,
        amiPercentage: `${i}`,
        annualIncomeMin: `${i}`,
        monthlyIncomeMin: `${i}`,
        floor: i,
        annualIncomeMax: `${i}`,
        maxOccupancy: i,
        minOccupancy: i,
        monthlyRent: `${i}`,
        numBathrooms: i,
        numBedrooms: i,
        number: `unit ${i}`,
        sqFeet: `${i}`,
        monthlyRentAsPercentOfIncome: `${i % UnitTypeSort.length}`,
        bmrProgramChart: !(i % 2),
        unitTypes: {
          id: `unitType ${i}`,
          createdAt: date,
          updatedAt: date,
          name: UnitTypeSort[i % UnitTypeSort.length] as UnitTypeEnum,
          numBedrooms: i,
        },
        unitAmiChartOverrides: {
          id: `unitAmiChartOverrides ${i}`,
          createdAt: date,
          updatedAt: date,
          items: [
            {
              percentOfAmi: i,
              householdSize: i,
              income: i,
            },
          ],
        },
        amiChart: {
          id: `AMI${i}`,
          items: [],
          name: `AMI Name ${i}`,
          createdAt: date,
          updatedAt: date,
          jurisdictions: {
            id: 'jurisdiction ID',
          },
        },
      });
    }
    toReturn.units = units;
  }

  return toReturn;
};

const mockListingSet = (
  pos: number,
  genUnits?: { numberToMake: number; date: Date },
) => {
  const toReturn = [];
  for (let i = 0; i < pos; i++) {
    toReturn.push(mockListing(i, genUnits));
  }
  return toReturn;
};

const requestApprovalMock = jest.fn();
const changesRequestedMock = jest.fn();
const listingApprovedMock = jest.fn();
const lotteryReleasedMock = jest.fn();
const lotteryPublishedAdminMock = jest.fn();
const lotteryPublishedApplicantMock = jest.fn();

const canOrThrowMock = jest.fn();

const user = new User();
user.firstName = 'Test';
user.lastName = 'User';
user.email = 'test@example.com';

describe('Testing listing service', () => {
  let service: ListingService;
  let prisma: PrismaService;
  let config: ConfigService;

  const googleTranslateServiceMock = {
    isConfigured: () => true,
    fetch: jest.fn(),
  };

  const httpServiceMock = {
    request: jest.fn().mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
      }),
    ),
  };

  const afsMock = {
    process: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        PrismaService,
        TranslationService,
        ApplicationService,
        GeocodingService,
        {
          provide: GoogleTranslateService,
          useValue: googleTranslateServiceMock,
        },
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
        {
          provide: ApplicationFlaggedSetService,
          useValue: afsMock,
        },
        {
          provide: EmailService,
          useValue: {
            requestApproval: requestApprovalMock,
            changesRequested: changesRequestedMock,
            listingApproved: listingApprovedMock,
            lotteryReleased: lotteryReleasedMock,
            lotteryPublishedAdmin: lotteryPublishedAdminMock,
            lotteryPublishedApplicant: lotteryPublishedApplicantMock,
          },
        },
        {
          provide: PermissionService,
          useValue: {
            canOrThrow: canOrThrowMock,
          },
        },
        ConfigService,
        Logger,
        SchedulerRegistry,
      ],
      imports: [HttpModule],
    }).compile();

    service = module.get<ListingService>(ListingService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterAll(() => {
    process.env.PROXY_URL = undefined;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  const exampleAddress = {
    city: 'Exygy',
    state: 'CA',
    zipCode: '94104',
    street: '548 Market St',
  };

  const exampleAsset = {
    fileId: randomUUID(),
    label: 'example asset label',
  };

  const constructFullListingData = (
    listingId?: string,
  ): ListingPublishedCreate | ListingPublishedUpdate => {
    return {
      id: listingId ?? undefined,
      assets: [exampleAsset],
      listingsBuildingAddress: exampleAddress,
      depositMin: '1000',
      depositMax: '5000',
      developer: 'example developer',
      digitalApplication: true,
      listingImages: [
        {
          ordinal: 0,
          assets: exampleAsset,
        },
      ],
      leasingAgentEmail: 'leasingAgent@exygy.com',
      leasingAgentName: 'Leasing Agent',
      leasingAgentPhone: '520-750-8811',
      name: 'example listing',
      paperApplication: false,
      referralOpportunity: false,
      rentalAssistance: 'rental assistance',
      reviewOrderType: ReviewOrderTypeEnum.firstComeFirstServe,
      units: [
        {
          amiPercentage: '1',
          annualIncomeMin: '2',
          monthlyIncomeMin: '3',
          floor: 4,
          annualIncomeMax: '5',
          maxOccupancy: 6,
          minOccupancy: 7,
          monthlyRent: '8',
          numBathrooms: 9,
          numBedrooms: 10,
          number: '11',
          sqFeet: '12',
          monthlyRentAsPercentOfIncome: '13',
          bmrProgramChart: true,
          unitTypes: {
            id: randomUUID(),
          },
          amiChart: {
            id: randomUUID(),
          },
          unitAccessibilityPriorityTypes: {
            id: randomUUID(),
          },
          unitRentTypes: {
            id: randomUUID(),
          },
          unitAmiChartOverrides: {
            items: [
              {
                percentOfAmi: 10,
                householdSize: 20,
                income: 30,
              },
            ],
          },
        },
      ],
      section8Acceptance: true,
      listingMultiselectQuestions: [
        {
          id: randomUUID(),
          ordinal: 0,
        },
      ],
      applicationMethods: [
        {
          type: ApplicationMethodsTypeEnum.Internal,
          label: 'example label',
          externalReference: 'example reference',
          acceptsPostmarkedApplications: false,
          phoneNumber: '520-750-8811',
          paperApplications: [
            {
              language: LanguagesEnum.en,
              assets: exampleAsset,
            },
          ],
        },
      ],
      unitsSummary: [
        {
          unitTypes: {
            id: randomUUID(),
          },
          monthlyRentMin: 1,
          monthlyRentMax: 2,
          monthlyRentAsPercentOfIncome: '3',
          amiPercentage: 4,
          minimumIncomeMin: '5',
          minimumIncomeMax: '6',
          maxOccupancy: 7,
          minOccupancy: 8,
          floorMin: 9,
          floorMax: 10,
          sqFeetMin: '11',
          sqFeetMax: '12',
          unitAccessibilityPriorityTypes: {
            id: randomUUID(),
          },
          totalCount: 13,
          totalAvailable: 14,
        },
      ],
      listingsApplicationPickUpAddress: exampleAddress,
      listingsApplicationMailingAddress: exampleAddress,
      listingsApplicationDropOffAddress: exampleAddress,
      listingsLeasingAgentAddress: exampleAddress,
      listingsBuildingSelectionCriteriaFile: exampleAsset,
      listingsResult: exampleAsset,
      listingEvents: [
        {
          type: ListingEventsTypeEnum.openHouse,
          startDate: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          url: 'https://www.google.com',
          note: 'example note',
          label: 'example label',
          assets: exampleAsset,
        },
      ],
      additionalApplicationSubmissionNotes: 'app submission notes',
      commonDigitalApplication: true,
      accessibility: 'accessibility string',
      amenities: 'amenities string',
      buildingTotalUnits: 5,
      householdSizeMax: 9,
      householdSizeMin: 1,
      neighborhood: 'neighborhood string',
      petPolicy: 'we love pets',
      smokingPolicy: 'smokeing policy string',
      unitsAvailable: 15,
      unitAmenities: 'unit amenity string',
      servicesOffered: 'services offered string',
      yearBuilt: 2023,
      applicationDueDate: new Date(),
      applicationOpenDate: new Date(),
      applicationFee: 'application fee string',
      applicationOrganization: 'app organization string',
      applicationPickUpAddressOfficeHours: 'pick up office hours string',
      applicationPickUpAddressType: ApplicationAddressTypeEnum.leasingAgent,
      applicationDropOffAddressOfficeHours: 'drop off office hours string',
      applicationDropOffAddressType: ApplicationAddressTypeEnum.leasingAgent,
      applicationMailingAddressType: ApplicationAddressTypeEnum.leasingAgent,
      buildingSelectionCriteria: 'https://selection-criteria.com',
      costsNotIncluded: 'all costs included',
      creditHistory: 'credit history',
      criminalBackground: 'criminal background',
      depositHelperText: 'deposit helper text',
      disableUnitsAccordion: false,
      leasingAgentOfficeHours: 'leasing agent office hours',
      leasingAgentTitle: 'leasing agent title',
      postmarkedApplicationsReceivedByDate: new Date(),
      programRules: 'program rules',
      rentalHistory: 'rental history',
      requiredDocuments: 'required docs',
      specialNotes: 'special notes',
      waitlistCurrentSize: 0,
      waitlistMaxSize: 100,
      whatToExpect: 'what to expect',
      status: ListingsStatusEnum.active,
      displayWaitlistSize: true,
      reservedCommunityDescription: 'reserved community description',
      reservedCommunityMinAge: 66,
      resultLink: 'result link',
      isWaitlistOpen: true,
      waitlistOpenSpots: 100,
      customMapPin: false,
      jurisdictions: {
        id: randomUUID(),
      },
      reservedCommunityTypes: {
        id: randomUUID(),
      },
      listingFeatures: {
        elevator: true,
        wheelchairRamp: false,
        serviceAnimalsAllowed: true,
        accessibleParking: false,
        parkingOnSite: true,
        inUnitWasherDryer: false,
        laundryInBuilding: true,
        barrierFreeEntrance: false,
        rollInShower: true,
        grabBars: false,
        heatingInUnit: true,
        acInUnit: false,
        hearing: true,
        visual: false,
        mobility: true,
      },
      listingUtilities: {
        water: false,
        gas: true,
        trash: false,
        sewer: true,
        electricity: false,
        cable: true,
        phone: false,
        internet: true,
      },
      homeType: 'apartment',
      isVerified: true,
    };
  };

  describe('Test list endpoint', () => {
    it('should handle call to list() with no params sent', async () => {
      prisma.listings.findMany = jest
        .fn()
        .mockResolvedValue(mockListingSet(10));

      prisma.listings.count = jest.fn().mockResolvedValue(10);

      const params: ListingsQueryParams = {};

      await service.list(params);

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: undefined,
        orderBy: undefined,
        where: {
          AND: [],
        },
        include: {
          jurisdictions: true,
          listingsBuildingAddress: true,
          requestedChangesUser: true,
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
        },
      });

      expect(prisma.listings.count).toHaveBeenCalledWith({
        where: {
          AND: [],
        },
      });
    });

    it('should handle call to list() with params sent', async () => {
      prisma.listings.findMany = jest
        .fn()
        .mockResolvedValue(mockListingSet(10));

      prisma.listings.count = jest.fn().mockResolvedValue(20);

      const params: ListingsQueryParams = {
        view: ListingViews.base,
        page: 2,
        limit: 10,
        orderBy: [ListingOrderByKeys.name],
        orderDir: [OrderByEnum.ASC],
        search: 'simple search',
        filter: [
          {
            [ListingFilterKeys.name]: 'Listing,name',
            $comparison: Compare.IN,
          },
          {
            [ListingFilterKeys.bedrooms]: 2,
            $comparison: Compare['>='],
          },
        ],
      };

      await service.list(params);

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: [
          {
            name: 'asc',
          },
        ],
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    in: ['listing', 'name'],
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                {
                  units: {
                    some: {
                      numBedrooms: {
                        gte: 2,
                      },
                    },
                  },
                },
              ],
            },
            {
              name: {
                contains: 'simple search',
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
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
          units: {
            include: {
              unitTypes: true,
              unitAmiChartOverrides: true,
            },
          },
        },
      });

      expect(prisma.listings.count).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    in: ['listing', 'name'],
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                {
                  units: {
                    some: {
                      numBedrooms: {
                        gte: 2,
                      },
                    },
                  },
                },
              ],
            },
            {
              name: {
                contains: 'simple search',
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    });

    it('should return first page if params are more than count', async () => {
      prisma.listings.findMany = jest
        .fn()
        .mockResolvedValue(mockListingSet(10));

      prisma.listings.count = jest.fn().mockResolvedValue(20);

      const params: ListingsQueryParams = {
        view: ListingViews.base,
        page: 2,
        limit: 30,
        orderBy: [ListingOrderByKeys.name],
        orderDir: [OrderByEnum.ASC],
      };

      await service.list(params);

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 30,
        orderBy: [
          {
            name: 'asc',
          },
        ],
        where: {
          AND: [],
        },
        include: {
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
          units: {
            include: {
              unitTypes: true,
              unitAmiChartOverrides: true,
            },
          },
        },
      });

      expect(prisma.listings.count).toHaveBeenCalledWith({
        where: {
          AND: [],
        },
      });
    });

    it('should build where clause when only params sent', async () => {
      const params: ListingFilterParams[] = [
        {
          [ListingFilterKeys.name]: 'Listing,name',
          $comparison: Compare.IN,
        },
        {
          [ListingFilterKeys.bedrooms]: 2,
          $comparison: Compare['>='],
        },
      ];

      expect(service.buildWhereClause(params)).toEqual({
        AND: [
          {
            OR: [
              {
                name: {
                  in: ['listing', 'name'],
                  mode: 'insensitive',
                },
              },
            ],
          },
          {
            OR: [
              {
                units: {
                  some: {
                    numBedrooms: {
                      gte: 2,
                    },
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should build where clause when only search param sent', async () => {
      expect(service.buildWhereClause(null, 'simple search')).toEqual({
        AND: [
          {
            name: {
              contains: 'simple search',
              mode: 'insensitive',
            },
          },
        ],
      });
    });

    it('should build where clause when params, and search param sent', async () => {
      const params: ListingFilterParams[] = [
        {
          [ListingFilterKeys.name]: 'Listing,name',
          $comparison: Compare.IN,
        },
        {
          [ListingFilterKeys.bedrooms]: 2,
          $comparison: Compare['>='],
        },
      ];

      expect(service.buildWhereClause(params, 'simple search')).toEqual({
        AND: [
          {
            OR: [
              {
                name: {
                  in: ['listing', 'name'],
                  mode: 'insensitive',
                },
              },
            ],
          },
          {
            OR: [
              {
                units: {
                  some: {
                    numBedrooms: {
                      gte: 2,
                    },
                  },
                },
              },
            ],
          },
          {
            name: {
              contains: 'simple search',
              mode: 'insensitive',
            },
          },
        ],
      });
    });

    it('should get records from list() with params and units', async () => {
      const date = new Date();

      prisma.listings.findMany = jest
        .fn()
        .mockResolvedValue([mockListing(9, { numberToMake: 9, date })]);

      prisma.listings.count = jest.fn().mockResolvedValue(20);

      const params: ListingsQueryParams = {
        view: ListingViews.base,
        page: 2,
        limit: 10,
        orderBy: [ListingOrderByKeys.name],
        orderDir: [OrderByEnum.ASC],
        search: 'simple search',
        filter: [
          {
            [ListingFilterKeys.name]: 'Listing,name',
            $comparison: Compare.IN,
          },
          {
            [ListingFilterKeys.bedrooms]: 2,
            $comparison: Compare['>='],
          },
        ],
      };

      const res = await service.list(params);

      expect(res.items[0].name).toEqual(`listing ${10}`);
      expect(res.items[0].units).toEqual(
        mockListing(9, { numberToMake: 9, date }).units,
      );
      expect(res.items[0].unitsSummarized).toEqual({
        byUnitTypeAndRent: [
          {
            areaRange: { min: 0, max: 7 },
            minIncomeRange: { min: '$0', max: '$7' },
            occupancyRange: { min: 0, max: 7 },
            rentRange: { min: '$0', max: '$7' },
            rentAsPercentIncomeRange: { min: 0, max: 0 },
            floorRange: { min: 0, max: 7 },
            unitTypes: {
              id: 'unitType 0',
              createdAt: date,
              updatedAt: date,
              name: 'SRO',
              numBedrooms: 0,
            },
            totalAvailable: 2,
          },
          {
            areaRange: { min: 1, max: 8 },
            minIncomeRange: { min: '$1', max: '$8' },
            occupancyRange: { min: 1, max: 8 },
            rentRange: { min: '$1', max: '$8' },
            rentAsPercentIncomeRange: { min: 1, max: 1 },
            floorRange: { min: 1, max: 8 },
            unitTypes: {
              id: 'unitType 1',
              createdAt: date,
              updatedAt: date,
              name: 'studio',
              numBedrooms: 1,
            },
            totalAvailable: 2,
          },
          {
            areaRange: { min: 2, max: 2 },
            minIncomeRange: { min: '$2', max: '$2' },
            occupancyRange: { min: 2, max: 2 },
            rentRange: { min: '$2', max: '$2' },
            rentAsPercentIncomeRange: { min: 2, max: 2 },
            floorRange: { min: 2, max: 2 },
            unitTypes: {
              id: 'unitType 2',
              createdAt: date,
              updatedAt: date,
              name: 'oneBdrm',
              numBedrooms: 2,
            },
            totalAvailable: 1,
          },
          {
            areaRange: { min: 3, max: 3 },
            minIncomeRange: { min: '$3', max: '$3' },
            occupancyRange: { min: 3, max: 3 },
            rentRange: { min: '$3', max: '$3' },
            rentAsPercentIncomeRange: { min: 3, max: 3 },
            floorRange: { min: 3, max: 3 },
            unitTypes: {
              id: 'unitType 3',
              createdAt: date,
              updatedAt: date,
              name: 'twoBdrm',
              numBedrooms: 3,
            },
            totalAvailable: 1,
          },
          {
            areaRange: { min: 4, max: 4 },
            minIncomeRange: { min: '$4', max: '$4' },
            occupancyRange: { min: 4, max: 4 },
            rentRange: { min: '$4', max: '$4' },
            rentAsPercentIncomeRange: { min: 4, max: 4 },
            floorRange: { min: 4, max: 4 },
            unitTypes: {
              id: 'unitType 4',
              createdAt: date,
              updatedAt: date,
              name: 'threeBdrm',
              numBedrooms: 4,
            },
            totalAvailable: 1,
          },
          {
            areaRange: { min: 5, max: 5 },
            minIncomeRange: { min: '$5', max: '$5' },
            occupancyRange: { min: 5, max: 5 },
            rentRange: { min: '$5', max: '$5' },
            rentAsPercentIncomeRange: { min: 5, max: 5 },
            floorRange: { min: 5, max: 5 },
            unitTypes: {
              id: 'unitType 5',
              createdAt: date,
              updatedAt: date,
              name: 'fourBdrm',
              numBedrooms: 5,
            },
            totalAvailable: 1,
          },
          {
            areaRange: { min: 6, max: 6 },
            minIncomeRange: { min: '$6', max: '$6' },
            occupancyRange: { min: 6, max: 6 },
            rentRange: { min: '$6', max: '$6' },
            rentAsPercentIncomeRange: { min: 6, max: 6 },
            floorRange: { min: 6, max: 6 },
            unitTypes: {
              id: 'unitType 6',
              createdAt: date,
              updatedAt: date,
              name: 'fiveBdrm',
              numBedrooms: 6,
            },
            totalAvailable: 1,
          },
        ],
      });

      expect(res.meta).toEqual({
        currentPage: 2,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 20,
        totalPages: 2,
      });

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: [
          {
            name: 'asc',
          },
        ],
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    in: ['listing', 'name'],
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                {
                  units: {
                    some: {
                      numBedrooms: {
                        gte: 2,
                      },
                    },
                  },
                },
              ],
            },
            {
              name: {
                contains: 'simple search',
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
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
          units: {
            include: {
              unitTypes: true,
              unitAmiChartOverrides: true,
            },
          },
        },
      });

      expect(prisma.listings.count).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                {
                  name: {
                    in: ['listing', 'name'],
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                {
                  units: {
                    some: {
                      numBedrooms: {
                        gte: 2,
                      },
                    },
                  },
                },
              ],
            },
            {
              name: {
                contains: 'simple search',
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    });
  });

  describe('Test buildWhereClause helper', () => {
    it('should return a where clause for filter bathrooms', () => {
      const filter = [
        { $comparison: '=', bathrooms: 2 } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                units: {
                  some: {
                    numBathrooms: {
                      equals: 2,
                    },
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter bedrooms', () => {
      const filter = [{ $comparison: '=', bedrooms: 2 } as ListingFilterParams];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                units: {
                  some: {
                    numBedrooms: {
                      equals: 2,
                    },
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter city', () => {
      const cityName = 'cityName';
      const filter = [
        { $comparison: '=', city: cityName } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                listingsBuildingAddress: {
                  city: {
                    equals: cityName,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter counties', () => {
      const counties = ['county1', 'county2'];
      const filter = [
        {
          $comparison: 'IN',
          counties: counties,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                listingsBuildingAddress: {
                  county: {
                    in: counties,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter homeTypes', () => {
      const homeTypes = [HomeTypeEnum.apartment, HomeTypeEnum.house];
      const filter = [
        {
          $comparison: 'IN',
          homeTypes: homeTypes,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                homeType: {
                  in: homeTypes,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter ids', () => {
      const uuids = [randomUUID(), randomUUID()];
      const filter = [
        {
          $comparison: 'IN',
          ids: uuids,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                id: {
                  in: uuids,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter isVerified', () => {
      const filter = [
        {
          $comparison: '=',
          isVerified: false,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                isVerified: {
                  equals: false,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter jurisdiction', () => {
      const jurisdictionId = randomUUID();
      const filter = [
        {
          $comparison: '=',
          jurisdiction: jurisdictionId,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                jurisdictionId: {
                  equals: jurisdictionId,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter leasingAgent', () => {
      const leasingAgentId = randomUUID();
      const filter = [
        {
          $comparison: '=',
          leasingAgent: leasingAgentId,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                userAccounts: {
                  some: {
                    id: {
                      equals: leasingAgentId,
                    },
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter listingFeatures', () => {
      const listingFeatures = ['hearing', 'acInUnit'];
      const filter = [
        {
          $comparison: '=',
          listingFeatures: listingFeatures,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                listingFeatures: {
                  hearing: true,
                },
              },
              {
                listingFeatures: {
                  acInUnit: true,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter monthlyRent', () => {
      const monthlyRent = '1500';
      const filter = [
        { $comparison: '=', monthlyRent: monthlyRent } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                units: {
                  some: {
                    monthlyRent: {
                      equals: monthlyRent,
                    },
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter name', () => {
      const name = 'listingName';
      const filter = [
        { $comparison: 'LIKE', name: name } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                name: {
                  contains: name,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter neighborhood', () => {
      const neighborhood = 'neighborhoodName';
      const filter = [
        { $comparison: '=', neighborhood: neighborhood } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                neighborhood: {
                  equals: neighborhood,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter regions', () => {
      const regions = [RegionEnum.Eastside, RegionEnum.Greater_Downtown];
      const filter = [
        { $comparison: 'IN', regions: regions } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                region: {
                  in: regions,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter reservedCommunityTypes', () => {
      const reservedCommunityTypes = ['Seniors', 'Veterans'];
      const reservedLowerCase = reservedCommunityTypes.map((rct) =>
        rct.toLowerCase(),
      );
      const filter = [
        {
          $comparison: 'IN',
          reservedCommunityTypes: reservedCommunityTypes,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                reservedCommunityTypes: {
                  name: {
                    in: reservedLowerCase,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter section8Acceptance', () => {
      const filter = [
        {
          $comparison: '=',
          section8Acceptance: false,
        } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                section8Acceptance: {
                  equals: false,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter status', () => {
      const status = ListingsStatusEnum.active;
      const filter = [
        { $comparison: '=', status: status } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                status: {
                  equals: status,
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for filter zipCode', () => {
      const zipCode = '10101';
      const filter = [
        { $comparison: '=', zipCode: zipCode } as ListingFilterParams,
      ];
      const whereClause = service.buildWhereClause(filter, '');

      expect(whereClause).toStrictEqual({
        AND: [
          {
            OR: [
              {
                listingsBuildingAddress: {
                  zipCode: {
                    equals: zipCode,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      });
    });

    it('should return a where clause for search', () => {
      const search = 'searchName';

      const whereClause = service.buildWhereClause([], search);

      expect(whereClause).toStrictEqual({
        AND: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    });
  });

  describe('Test findOne endpoint', () => {
    it('should return records from findOne() with base view', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue(mockListing(0));

      await service.findOne('listingId', LanguagesEnum.en, ListingViews.base);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'listingId',
        },
        include: {
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
          units: {
            include: {
              unitTypes: true,
              unitAmiChartOverrides: true,
            },
          },
        },
      });
    });

    it('should handle no records returned when findOne() is called with details view', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        async () =>
          await service.findOne(
            'a different listingId',
            LanguagesEnum.en,
            ListingViews.details,
          ),
      ).rejects.toThrowError();

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'a different listingId',
        },
        include: {
          jurisdictions: true,
          listingsBuildingAddress: true,
          requestedChangesUser: true,
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
        },
      });
    });
    it('should get records from findOne() with base view found and units', async () => {
      const date = new Date();

      const mockedListing = mockListing(0, { numberToMake: 10, date });

      prisma.listings.findUnique = jest.fn().mockResolvedValue(mockedListing);

      prisma.amiChart.findMany = jest.fn().mockResolvedValue([
        {
          id: 'AMI0',
          items: [],
          name: '`AMI Name 0`',
        },
        {
          id: 'AMI1',
          items: [],
          name: '`AMI Name 1`',
        },
      ]);

      const listing: Listing = await service.findOne(
        'listingId',
        LanguagesEnum.en,
        ListingViews.base,
      );

      expect(listing.id).toEqual('0');
      expect(listing.name).toEqual('listing 1');
      expect(listing.units).toEqual(mockedListing.units);
      expect(listing.unitsSummarized.amiPercentages).toEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
      ]);
      expect(listing.unitsSummarized?.byAMI).toEqual([
        {
          percent: '0',
          byUnitType: [
            {
              areaRange: { min: 0, max: 0 },
              minIncomeRange: { min: '$0', max: '$0' },
              occupancyRange: { min: 0, max: 0 },
              rentRange: { min: '$0', max: '$0' },
              rentAsPercentIncomeRange: { min: 0, max: 0 },
              floorRange: { min: 0, max: 0 },
              unitTypes: {
                id: 'unitType 0',
                createdAt: date,
                updatedAt: date,
                name: 'SRO',
                numBedrooms: 0,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '1',
          byUnitType: [
            {
              areaRange: { min: 1, max: 1 },
              minIncomeRange: { min: '$1', max: '$1' },
              occupancyRange: { min: 1, max: 1 },
              rentRange: { min: '$1', max: '$1' },
              rentAsPercentIncomeRange: { min: 1, max: 1 },
              floorRange: { min: 1, max: 1 },
              unitTypes: {
                id: 'unitType 1',
                createdAt: date,
                updatedAt: date,
                name: 'studio',
                numBedrooms: 1,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '2',
          byUnitType: [
            {
              areaRange: { min: 2, max: 2 },
              minIncomeRange: { min: '$2', max: '$2' },
              occupancyRange: { min: 2, max: 2 },
              rentRange: { min: '$2', max: '$2' },
              rentAsPercentIncomeRange: { min: 2, max: 2 },
              floorRange: { min: 2, max: 2 },
              unitTypes: {
                id: 'unitType 2',
                createdAt: date,
                updatedAt: date,
                name: 'oneBdrm',
                numBedrooms: 2,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '3',
          byUnitType: [
            {
              areaRange: { min: 3, max: 3 },
              minIncomeRange: { min: '$3', max: '$3' },
              occupancyRange: { min: 3, max: 3 },
              rentRange: { min: '$3', max: '$3' },
              rentAsPercentIncomeRange: { min: 3, max: 3 },
              floorRange: { min: 3, max: 3 },
              unitTypes: {
                id: 'unitType 3',
                createdAt: date,
                updatedAt: date,
                name: 'twoBdrm',
                numBedrooms: 3,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '4',
          byUnitType: [
            {
              areaRange: { min: 4, max: 4 },
              minIncomeRange: { min: '$4', max: '$4' },
              occupancyRange: { min: 4, max: 4 },
              rentRange: { min: '$4', max: '$4' },
              rentAsPercentIncomeRange: { min: 4, max: 4 },
              floorRange: { min: 4, max: 4 },
              unitTypes: {
                id: 'unitType 4',
                createdAt: date,
                updatedAt: date,
                name: 'threeBdrm',
                numBedrooms: 4,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '5',
          byUnitType: [
            {
              areaRange: { min: 5, max: 5 },
              minIncomeRange: { min: '$5', max: '$5' },
              occupancyRange: { min: 5, max: 5 },
              rentRange: { min: '$5', max: '$5' },
              rentAsPercentIncomeRange: { min: 5, max: 5 },
              floorRange: { min: 5, max: 5 },
              unitTypes: {
                id: 'unitType 5',
                createdAt: date,
                updatedAt: date,
                name: 'fourBdrm',
                numBedrooms: 5,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '6',
          byUnitType: [
            {
              areaRange: { min: 6, max: 6 },
              minIncomeRange: { min: '$6', max: '$6' },
              occupancyRange: { min: 6, max: 6 },
              rentRange: { min: '$6', max: '$6' },
              rentAsPercentIncomeRange: { min: 6, max: 6 },
              floorRange: { min: 6, max: 6 },
              unitTypes: {
                id: 'unitType 6',
                createdAt: date,
                updatedAt: date,
                name: 'fiveBdrm',
                numBedrooms: 6,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '7',
          byUnitType: [
            {
              areaRange: { min: 7, max: 7 },
              minIncomeRange: { min: '$7', max: '$7' },
              occupancyRange: { min: 7, max: 7 },
              rentRange: { min: '$7', max: '$7' },
              rentAsPercentIncomeRange: { min: 0, max: 0 },
              floorRange: { min: 7, max: 7 },
              unitTypes: {
                id: 'unitType 7',
                createdAt: date,
                updatedAt: date,
                name: 'SRO',
                numBedrooms: 7,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '8',
          byUnitType: [
            {
              areaRange: { min: 8, max: 8 },
              minIncomeRange: { min: '$8', max: '$8' },
              occupancyRange: { min: 8, max: 8 },
              rentRange: { min: '$8', max: '$8' },
              rentAsPercentIncomeRange: { min: 1, max: 1 },
              floorRange: { min: 8, max: 8 },
              unitTypes: {
                id: 'unitType 8',
                createdAt: date,
                updatedAt: date,
                name: 'studio',
                numBedrooms: 8,
              },
              totalAvailable: 1,
            },
          ],
        },
        {
          percent: '9',
          byUnitType: [
            {
              areaRange: { min: 9, max: 9 },
              minIncomeRange: { min: '$9', max: '$9' },
              occupancyRange: { min: 9, max: 9 },
              rentRange: { min: '$9', max: '$9' },
              rentAsPercentIncomeRange: { min: 2, max: 2 },
              floorRange: { min: 9, max: 9 },
              unitTypes: {
                id: 'unitType 9',
                createdAt: date,
                updatedAt: date,
                name: 'oneBdrm',
                numBedrooms: 9,
              },
              totalAvailable: 1,
            },
          ],
        },
      ]);
      expect(listing.unitsSummarized.unitTypes).toEqual([
        {
          createdAt: date,
          id: 'unitType 0',
          name: 'SRO',
          numBedrooms: 0,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 1',
          name: 'studio',
          numBedrooms: 1,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 2',
          name: 'oneBdrm',
          numBedrooms: 2,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 3',
          name: 'twoBdrm',
          numBedrooms: 3,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 4',
          name: 'threeBdrm',
          numBedrooms: 4,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 5',
          name: 'fourBdrm',
          numBedrooms: 5,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 6',
          name: 'fiveBdrm',
          numBedrooms: 6,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 7',
          name: 'SRO',
          numBedrooms: 7,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 8',
          name: 'studio',
          numBedrooms: 8,
          updatedAt: date,
        },
        {
          createdAt: date,
          id: 'unitType 9',
          name: 'oneBdrm',
          numBedrooms: 9,
          updatedAt: date,
        },
      ]);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'listingId',
        },
        include: {
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
          units: {
            include: {
              unitTypes: true,
              unitAmiChartOverrides: true,
            },
          },
        },
      });

      expect(prisma.amiChart.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: mockedListing.units.map((unit) => unit.amiChart.id),
          },
        },
      });
    });

    it('should get records from findOne() with details view found and units', async () => {
      const date = new Date();

      const mockedListing = mockListing(0, { numberToMake: 1, date });

      prisma.listings.findUnique = jest.fn().mockResolvedValue(mockedListing);

      prisma.amiChart.findMany = jest.fn().mockResolvedValue([
        {
          id: 'AMI0',
          items: [],
          name: '`AMI Name 0`',
        },
        {
          id: 'AMI1',
          items: [],
          name: '`AMI Name 1`',
        },
      ]);

      const listing: Listing = await service.findOne(
        'listingId',
        LanguagesEnum.en,
        ListingViews.details,
      );

      expect(listing.id).toEqual('0');
      expect(listing.name).toEqual('listing 1');
      expect(listing.units).toEqual(mockedListing.units);
      expect(listing.unitsSummarized.amiPercentages).toEqual(['0']);
      expect(listing.unitsSummarized?.byAMI).toEqual([
        {
          percent: '0',
          byUnitType: [
            {
              areaRange: { min: 0, max: 0 },
              minIncomeRange: { min: '$0', max: '$0' },
              occupancyRange: { min: 0, max: 0 },
              rentRange: { min: '$0', max: '$0' },
              rentAsPercentIncomeRange: { min: 0, max: 0 },
              floorRange: { min: 0, max: 0 },
              unitTypes: {
                id: 'unitType 0',
                createdAt: date,
                updatedAt: date,
                name: 'SRO',
                numBedrooms: 0,
              },
              totalAvailable: 1,
            },
          ],
        },
      ]);
      expect(listing.unitsSummarized.unitTypes).toEqual([
        {
          createdAt: date,
          id: 'unitType 0',
          name: 'SRO',
          numBedrooms: 0,
          updatedAt: date,
        },
      ]);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'listingId',
        },
        include: {
          jurisdictions: true,
          listingsBuildingAddress: true,
          requestedChangesUser: true,
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
        },
      });

      expect(prisma.amiChart.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: mockedListing.units.map((unit) => unit.amiChart.id),
          },
        },
      });
    });
  });

  describe('Test findListingsWithMultiSelectQuestion endpoint', () => {
    it('should return listings from findListingsWithMultiSelectQuestion()', async () => {
      prisma.listings.findMany = jest.fn().mockResolvedValue([
        {
          id: 'example id',
          name: 'example name',
        },
      ]);

      const listings = await service.findListingsWithMultiSelectQuestion(
        'multiselectQuestionId 1',
      );

      expect(listings.length).toEqual(1);
      expect(listings[0].id).toEqual('example id');
      expect(listings[0].name).toEqual('example name');

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
        },
        where: {
          listingMultiselectQuestions: {
            some: {
              multiselectQuestionId: 'multiselectQuestionId 1',
            },
          },
        },
      });
    });
  });

  describe('Test create endpoint', () => {
    it('should create a simple listing', async () => {
      prisma.listings.create = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });

      await service.create(
        {
          name: 'example listing name',
          depositMin: '5',
          assets: [
            {
              fileId: randomUUID(),
              label: 'example asset',
            },
          ],
          jurisdictions: {
            id: randomUUID(),
          },
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: null,
          listingEvents: [],
          isVerified: true,
        } as ListingCreate,
        user,
      );

      expect(prisma.listings.create).toHaveBeenCalledWith({
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsApplicationMailingAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
        data: {
          name: 'example listing name',
          contentUpdatedAt: expect.anything(),
          depositMin: '5',
          assets: {
            create: [
              {
                fileId: expect.anything(),
                label: 'example asset',
              },
            ],
          },
          jurisdictions: {
            connect: {
              id: expect.anything(),
            },
          },
          section8Acceptance: false,
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: undefined,
          unitsAvailable: 0,
          listingEvents: {
            create: [],
          },
          isVerified: true,
        },
      });

      expect(canOrThrowMock).toHaveBeenCalledWith(
        user,
        'listing',
        permissionActions.create,
        {
          jurisdictionId: expect.anything(),
        },
      );
    });

    it('should create a complete listing', async () => {
      prisma.listings.create = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });

      const val = constructFullListingData();

      await service.create(val as ListingCreate, user);

      expect(prisma.listings.create).toHaveBeenCalledWith({
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsApplicationMailingAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
        data: {
          ...val,
          isVerified: true,
          contentUpdatedAt: expect.anything(),
          publishedAt: expect.anything(),
          assets: {
            create: [exampleAsset],
          },
          applicationMethods: {
            create: [
              {
                type: ApplicationMethodsTypeEnum.Internal,
                label: 'example label',
                externalReference: 'example reference',
                acceptsPostmarkedApplications: false,
                phoneNumber: '520-750-8811',
                paperApplications: {
                  create: [
                    {
                      language: LanguagesEnum.en,
                      assets: {
                        create: {
                          ...exampleAsset,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
          listingEvents: {
            create: [
              {
                type: ListingEventsTypeEnum.openHouse,
                startDate: expect.anything(),
                startTime: expect.anything(),
                endTime: expect.anything(),
                url: 'https://www.google.com',
                note: 'example note',
                label: 'example label',
                assets: {
                  create: {
                    ...exampleAsset,
                  },
                },
              },
            ],
          },
          listingImages: {
            create: [
              {
                assets: {
                  create: {
                    ...exampleAsset,
                  },
                },
                ordinal: 0,
              },
            ],
          },
          listingMultiselectQuestions: {
            create: [
              {
                ordinal: 0,
                multiselectQuestions: {
                  connect: {
                    id: expect.anything(),
                  },
                },
              },
            ],
          },
          listingsApplicationDropOffAddress: {
            create: {
              ...exampleAddress,
            },
          },
          reservedCommunityTypes: {
            connect: {
              id: expect.anything(),
            },
          },
          listingsBuildingSelectionCriteriaFile: {
            create: {
              ...exampleAsset,
            },
          },
          listingUtilities: {
            create: {
              water: false,
              gas: true,
              trash: false,
              sewer: true,
              electricity: false,
              cable: true,
              phone: false,
              internet: true,
            },
          },
          listingsApplicationMailingAddress: {
            create: {
              ...exampleAddress,
            },
          },
          listingsLeasingAgentAddress: {
            create: {
              ...exampleAddress,
            },
          },
          listingFeatures: {
            create: {
              elevator: true,
              wheelchairRamp: false,
              serviceAnimalsAllowed: true,
              accessibleParking: false,
              parkingOnSite: true,
              inUnitWasherDryer: false,
              laundryInBuilding: true,
              barrierFreeEntrance: false,
              rollInShower: true,
              grabBars: false,
              heatingInUnit: true,
              acInUnit: false,
              hearing: true,
              visual: false,
              mobility: true,
            },
          },
          jurisdictions: {
            connect: {
              id: expect.anything(),
            },
          },
          listingsApplicationPickUpAddress: {
            create: {
              ...exampleAddress,
            },
          },
          listingsBuildingAddress: {
            create: {
              ...exampleAddress,
            },
          },
          units: {
            create: [
              {
                amiPercentage: '1',
                annualIncomeMin: '2',
                monthlyIncomeMin: '3',
                floor: 4,
                annualIncomeMax: '5',
                maxOccupancy: 6,
                minOccupancy: 7,
                monthlyRent: '8',
                numBathrooms: 9,
                numBedrooms: 10,
                number: '11',
                sqFeet: '12',
                monthlyRentAsPercentOfIncome: '13',
                bmrProgramChart: true,
                unitTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                amiChart: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitAmiChartOverrides: {
                  create: {
                    items: [
                      {
                        percentOfAmi: 10,
                        householdSize: 20,
                        income: 30,
                      },
                    ],
                  },
                },
                unitAccessibilityPriorityTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitRentTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
              },
            ],
          },
          section8Acceptance: true,
          unitsSummary: {
            create: [
              {
                monthlyRentMin: 1,
                monthlyRentMax: 2,
                monthlyRentAsPercentOfIncome: '3',
                amiPercentage: 4,
                minimumIncomeMin: '5',
                minimumIncomeMax: '6',
                maxOccupancy: 7,
                minOccupancy: 8,
                floorMin: 9,
                floorMax: 10,
                sqFeetMin: '11',
                sqFeetMax: '12',
                totalCount: 13,
                totalAvailable: 14,
                unitTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitAccessibilityPriorityTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
              },
            ],
          },
          listingsResult: {
            create: {
              ...exampleAsset,
            },
          },
        },
      });

      expect(canOrThrowMock).toHaveBeenCalledWith(
        user,
        'listing',
        permissionActions.create,
        {
          jurisdictionId: val.jurisdictions.id,
        },
      );
    });

    it('should create a simple, duplicate listing', async () => {
      prisma.listings.create = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });

      await service.create(
        {
          name: 'example listing name',
          depositMin: '5',
          assets: [
            {
              fileId: randomUUID(),
              label: 'example asset',
            },
          ],
          jurisdictions: {
            id: randomUUID(),
          },
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: null,
          listingEvents: [],
          isVerified: false,
        } as ListingCreate,
        user,
        'original id',
      );

      expect(prisma.listings.create).toHaveBeenCalledWith({
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsApplicationMailingAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
        data: {
          name: 'example listing name',
          contentUpdatedAt: expect.anything(),
          depositMin: '5',
          assets: {
            create: [
              {
                fileId: expect.anything(),
                label: 'example asset',
              },
            ],
          },
          jurisdictions: {
            connect: {
              id: expect.anything(),
            },
          },
          isVerified: false,
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: undefined,
          unitsAvailable: 0,
          listingEvents: {
            create: [],
          },
          section8Acceptance: false,
          copyOf: {
            connect: {
              id: expect.anything(),
            },
          },
        },
      });

      expect(canOrThrowMock).toHaveBeenCalledWith(
        user,
        'listing',
        permissionActions.create,
        {
          jurisdictionId: expect.anything(),
        },
      );
    });
  });

  describe('Test duplicate endpoint', () => {
    it('should duplicate a listing, including units', async () => {
      const listing = mockListing(1, { numberToMake: 2, date: new Date() });

      const newName = 'duplicate name';

      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        ...listing,
        jurisdictions: {
          id: randomUUID(),
        },
      });

      prisma.listings.create = jest.fn().mockResolvedValue({
        ...listing,
        id: 'duplicate id',
        name: newName,
      });

      const newListing = await service.duplicate(
        {
          includeUnits: true,
          name: newName,
          storedListing: {
            id: listing.id.toString(),
          },
        },
        user,
      );

      expect(newListing.name).toBe(newName);
      expect(newListing.units).toEqual(listing.units);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: listing.id.toString(),
        },
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsApplicationMailingAddress: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
      });
    });

    it('should duplicate a listing, excluding units', async () => {
      const listing = mockListing(1, { numberToMake: 2, date: new Date() });

      const newName = 'duplicate name';

      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        ...listing,
        jurisdictions: {
          id: randomUUID(),
        },
      });

      prisma.listings.create = jest.fn().mockResolvedValue({
        ...listing,
        id: 'duplicate id',
        name: newName,
        units: [],
      });

      const newListing = await service.duplicate(
        {
          includeUnits: false,
          name: newName,
          storedListing: {
            id: listing.id.toString(),
          },
        },
        user,
      );

      expect(newListing.name).toBe(newName);
      expect(newListing.units).toEqual([]);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: listing.id.toString(),
        },
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsApplicationMailingAddress: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
      });
    });

    it('should fail to duplicate a listing with the same name', async () => {
      const listing = mockListing(1, { numberToMake: 2, date: new Date() });

      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        ...listing,
        jurisdictions: {
          id: randomUUID(),
        },
      });

      await expect(
        async () =>
          await service.duplicate(
            {
              includeUnits: false,
              name: listing.name,
              storedListing: {
                id: listing.id.toString(),
              },
            },
            user,
          ),
      ).rejects.toThrowError();

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: listing.id.toString(),
        },
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsApplicationMailingAddress: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
      });
    });
  });

  describe('Test delete endpoint', () => {
    it('should delete a listing', async () => {
      const id = randomUUID();
      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        id,
      });
      prisma.listings.delete = jest.fn().mockResolvedValue({
        id,
      });

      await service.delete(id, {
        id: 'requestingUser id',
        userRoles: { isAdmin: true },
      } as unknown as User);

      expect(canOrThrowMock).toHaveBeenCalledWith(
        {
          id: 'requestingUser id',
          userRoles: { isAdmin: true },
        } as unknown as User,
        'listing',
        permissionActions.delete,
        {
          id,
        },
      );

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(prisma.listings.delete).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
    });

    it('should error when nonexistent id is passed to delete()', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue(null);
      prisma.listings.delete = jest.fn().mockResolvedValue(null);

      await expect(
        async () =>
          await service.delete(randomUUID(), {
            id: 'requestingUser id',
            userRoles: { isAdmin: true },
          } as unknown as User),
      ).rejects.toThrowError();

      expect(canOrThrowMock).not.toHaveBeenCalled();

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: expect.anything(),
        },
      });

      expect(prisma.listings.delete).not.toHaveBeenCalled();
    });
  });

  describe('Test findOrThrow endpoint', () => {
    it('should return listing from call to findOrThrow()', async () => {
      const id = randomUUID();
      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        id,
      });

      await service.findOrThrow(id, ListingViews.fundamentals);

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        include: {
          jurisdictions: true,
          listingFeatures: true,
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
          listingUtilities: true,
          listingsBuildingAddress: true,
          reservedCommunityTypes: true,
        },
        where: {
          id: id,
        },
      });
    });

    it('should error when nonexistent id is passed to findOrThrow()', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        async () => await service.findOrThrow(randomUUID()),
      ).rejects.toThrowError();

      expect(prisma.listings.findUnique).toHaveBeenCalledWith({
        where: {
          id: expect.anything(),
        },
      });
    });
  });

  describe('Test update endpoint', () => {
    it('should update a simple listing', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.listings.update = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.listingEvents.findMany = jest.fn().mockResolvedValue([]);
      prisma.listingEvents.update = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.assets.delete = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.$transaction = jest
        .fn()
        .mockResolvedValue([{ id: 'example id', name: 'example name' }]);
      prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue(null);

      await service.update(
        {
          id: randomUUID(),
          name: 'example listing name',
          depositMin: '5',
          assets: [
            {
              fileId: randomUUID(),
              label: 'example asset',
            },
          ],
          jurisdictions: {
            id: randomUUID(),
          },
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: null,
          listingEvents: [],
        } as ListingUpdate,
        user,
      );

      expect(prisma.listings.update).toHaveBeenCalledWith({
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsApplicationMailingAddress: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          requestedChangesUser: true,
          reservedCommunityTypes: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
        data: {
          name: 'example listing name',
          contentUpdatedAt: expect.anything(),
          depositMin: '5',
          assets: [
            {
              fileId: expect.anything(),
              label: 'example asset',
            },
          ],

          jurisdictions: {
            connect: {
              id: expect.anything(),
            },
          },
          status: ListingsStatusEnum.pending,
          displayWaitlistSize: false,
          unitsSummary: undefined,
          listingEvents: {
            create: [],
          },
          listingsBuildingSelectionCriteriaFile: {
            disconnect: true,
          },
          section8Acceptance: false,
          unitsAvailable: 0,
          isVerified: false,
        },
        where: {
          id: expect.anything(),
        },
      });

      expect(canOrThrowMock).toHaveBeenCalledWith(
        user,
        'listing',
        permissionActions.update,
        {
          id: 'example id',
        },
      );
    });

    it('should do a complete listing update', async () => {
      prisma.listings.findUnique = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
        reservedCommunityTypes: {
          id: randomUUID(),
        },
      });
      prisma.listings.update = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.listingEvents.findMany = jest.fn().mockResolvedValue([]);
      prisma.listingEvents.update = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      prisma.assets.delete = jest.fn().mockResolvedValue({
        id: 'example id',
        name: 'example name',
      });
      const updateMock = jest
        .fn()
        .mockResolvedValue({ id: 'example id', name: 'example name' });

      prisma.$transaction = jest
        .fn()
        .mockResolvedValue([
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          updateMock,
        ]);

      const val = constructFullListingData(randomUUID());
      prisma.assets.create = jest.fn().mockResolvedValue({ id: randomUUID() });
      prisma.address.create = jest.fn().mockResolvedValue({ id: randomUUID() });
      val.reservedCommunityTypes = null;

      await service.update(val as ListingUpdate, user);

      expect(prisma.listings.update).toHaveBeenCalledWith({
        include: {
          applicationMethods: {
            include: {
              paperApplications: {
                include: {
                  assets: true,
                },
              },
            },
          },
          jurisdictions: true,
          listingEvents: {
            include: {
              assets: true,
            },
          },
          listingFeatures: true,
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
          listingUtilities: true,
          listingsApplicationDropOffAddress: true,
          listingsApplicationPickUpAddress: true,
          listingsApplicationMailingAddress: true,
          listingsBuildingAddress: true,
          listingsBuildingSelectionCriteriaFile: true,
          listingsLeasingAgentAddress: true,
          listingsResult: true,
          reservedCommunityTypes: true,
          requestedChangesUser: true,
          units: {
            include: {
              amiChart: {
                include: {
                  jurisdictions: true,
                  unitGroupAmiLevels: true,
                },
              },
              unitAccessibilityPriorityTypes: true,
              unitAmiChartOverrides: true,
              unitRentTypes: true,
              unitTypes: true,
            },
          },
        },
        data: {
          ...val,
          id: undefined,
          publishedAt: expect.anything(),
          contentUpdatedAt: expect.anything(),
          assets: [exampleAsset],
          applicationMethods: {
            create: [
              {
                type: ApplicationMethodsTypeEnum.Internal,
                label: 'example label',
                externalReference: 'example reference',
                acceptsPostmarkedApplications: false,
                phoneNumber: '520-750-8811',
                paperApplications: {
                  create: [
                    {
                      language: LanguagesEnum.en,
                      assets: {
                        create: {
                          ...exampleAsset,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
          listingEvents: {
            create: [
              {
                type: ListingEventsTypeEnum.openHouse,
                startDate: expect.anything(),
                startTime: expect.anything(),
                endTime: expect.anything(),
                url: 'https://www.google.com',
                note: 'example note',
                label: 'example label',
                assets: {
                  create: {
                    ...exampleAsset,
                  },
                },
              },
            ],
          },
          listingImages: {
            create: [
              {
                assets: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                ordinal: 0,
              },
            ],
          },
          listingMultiselectQuestions: {
            create: [
              {
                multiselectQuestionId: expect.anything(),
                ordinal: 0,
              },
            ],
          },
          listingsApplicationDropOffAddress: {
            connect: {
              id: expect.anything(),
            },
          },
          reservedCommunityTypes: {
            disconnect: {
              id: expect.anything(),
            },
          },
          listingsBuildingSelectionCriteriaFile: {
            create: {
              ...exampleAsset,
            },
          },
          listingUtilities: {
            create: {
              water: false,
              gas: true,
              trash: false,
              sewer: true,
              electricity: false,
              cable: true,
              phone: false,
              internet: true,
            },
          },
          listingsApplicationMailingAddress: {
            connect: {
              id: expect.anything(),
            },
          },
          listingsLeasingAgentAddress: {
            connect: {
              id: expect.anything(),
            },
          },
          listingFeatures: {
            create: {
              elevator: true,
              wheelchairRamp: false,
              serviceAnimalsAllowed: true,
              accessibleParking: false,
              parkingOnSite: true,
              inUnitWasherDryer: false,
              laundryInBuilding: true,
              barrierFreeEntrance: false,
              rollInShower: true,
              grabBars: false,
              heatingInUnit: true,
              acInUnit: false,
              hearing: true,
              visual: false,
              mobility: true,
            },
          },
          jurisdictions: {
            connect: {
              id: expect.anything(),
            },
          },
          listingsApplicationPickUpAddress: {
            connect: {
              id: expect.anything(),
            },
          },
          listingsBuildingAddress: {
            connect: {
              id: expect.anything(),
            },
          },
          units: {
            create: [
              {
                amiPercentage: '1',
                annualIncomeMin: '2',
                monthlyIncomeMin: '3',
                floor: 4,
                annualIncomeMax: '5',
                maxOccupancy: 6,
                minOccupancy: 7,
                monthlyRent: '8',
                numBathrooms: 9,
                numBedrooms: 10,
                number: '11',
                sqFeet: '12',
                monthlyRentAsPercentOfIncome: '13',
                bmrProgramChart: true,
                unitTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                amiChart: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitAmiChartOverrides: {
                  create: {
                    items: [
                      {
                        percentOfAmi: 10,
                        householdSize: 20,
                        income: 30,
                      },
                    ],
                  },
                },
                unitAccessibilityPriorityTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitRentTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
              },
            ],
          },
          section8Acceptance: true,
          unitsSummary: {
            create: [
              {
                monthlyRentMin: 1,
                monthlyRentMax: 2,
                monthlyRentAsPercentOfIncome: '3',
                amiPercentage: 4,
                minimumIncomeMin: '5',
                minimumIncomeMax: '6',
                maxOccupancy: 7,
                minOccupancy: 8,
                floorMin: 9,
                floorMax: 10,
                sqFeetMin: '11',
                sqFeetMax: '12',
                totalCount: 13,
                totalAvailable: 14,
                unitTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
                unitAccessibilityPriorityTypes: {
                  connect: {
                    id: expect.anything(),
                  },
                },
              },
            ],
          },
          listingsResult: {
            create: {
              ...exampleAsset,
            },
          },
          isVerified: true,
        },
        where: {
          id: expect.anything(),
        },
      });

      expect(canOrThrowMock).toHaveBeenCalledWith(
        user,
        'listing',
        permissionActions.update,
        {
          id: 'example id',
        },
      );
    });
  });

  describe('Test listingApprovalNotify endpoint', () => {
    it('listingApprovalNotify request approval email', async () => {
      jest
        .spyOn(service, 'getUserEmailInfo')
        .mockResolvedValueOnce({ emails: ['admin@email.com'] });
      await service.listingApprovalNotify({
        user,
        listingInfo: { id: 'id', name: 'name' },
        status: ListingsStatusEnum.pendingReview,
        approvingRoles: [UserRoleEnum.admin],
        jurisId: 'jurisId',
      });

      expect(service.getUserEmailInfo).toBeCalledWith(
        ['admin'],
        'id',
        'jurisId',
      );
      expect(requestApprovalMock).toBeCalledWith(
        { id: 'jurisId' },
        { id: 'id', name: 'name' },
        ['admin@email.com'],
        config.get('PARTNERS_PORTAL_URL'),
      );
    });

    it('listingApprovalNotify changes requested email', async () => {
      jest.spyOn(service, 'getUserEmailInfo').mockResolvedValueOnce({
        emails: ['jurisAdmin@email.com', 'partner@email.com'],
      });
      await service.listingApprovalNotify({
        user,
        listingInfo: { id: 'id', name: 'name' },
        status: ListingsStatusEnum.changesRequested,
        approvingRoles: [UserRoleEnum.admin],
        jurisId: 'jurisId',
      });

      expect(service.getUserEmailInfo).toBeCalledWith(
        ['partner', 'jurisdictionAdmin'],
        'id',
        'jurisId',
      );
      expect(changesRequestedMock).toBeCalledWith(
        user,
        { id: 'id', name: 'name', juris: 'jurisId' },
        ['jurisAdmin@email.com', 'partner@email.com'],
        config.get('PARTNERS_PORTAL_URL'),
      );
    });

    it('listingApprovalNotify listing approved email', async () => {
      jest.spyOn(service, 'getUserEmailInfo').mockResolvedValueOnce({
        emails: ['jurisAdmin@email.com', 'partner@email.com'],
        publicUrl: 'public.housing.gov',
      });
      await service.listingApprovalNotify({
        user,
        listingInfo: { id: 'id', name: 'name' },
        status: ListingsStatusEnum.active,
        previousStatus: ListingsStatusEnum.pendingReview,
        approvingRoles: [UserRoleEnum.admin],
        jurisId: 'jurisId',
      });

      expect(service.getUserEmailInfo).toBeCalledWith(
        ['partner', 'jurisdictionAdmin'],
        'id',
        'jurisId',
        true,
      );
      expect(listingApprovedMock).toBeCalledWith(
        expect.objectContaining({ id: 'jurisId' }),
        { id: 'id', name: 'name' },
        ['jurisAdmin@email.com', 'partner@email.com'],
        'public.housing.gov',
      );
    });

    it('listingApprovalNotify active listing not requiring email', async () => {
      await service.listingApprovalNotify({
        user,
        listingInfo: { id: 'id', name: 'name' },
        status: ListingsStatusEnum.active,
        previousStatus: ListingsStatusEnum.active,
        approvingRoles: [UserRoleEnum.admin],
        jurisId: 'jurisId',
      });

      expect(listingApprovedMock).toBeCalledTimes(0);
    });
  });

  describe('Test cachePurge endpoint', () => {
    it('should purge single listing', async () => {
      const id = randomUUID();
      process.env.PROXY_URL = 'https://www.google.com';
      await service.cachePurge(
        ListingsStatusEnum.pending,
        ListingsStatusEnum.pending,
        id,
      );
      expect(httpServiceMock.request).toHaveBeenCalledWith({
        baseURL: 'https://www.google.com',
        method: 'PURGE',
        url: `/listings/${id}*`,
      });

      process.env.PROXY_URL = undefined;
    });

    it('should purge all listings', async () => {
      const id = randomUUID();
      process.env.PROXY_URL = 'https://www.google.com';
      await service.cachePurge(
        ListingsStatusEnum.active,
        ListingsStatusEnum.pending,
        id,
      );
      expect(httpServiceMock.request).toHaveBeenCalledWith({
        baseURL: 'https://www.google.com',
        method: 'PURGE',
        url: `/listings?*`,
      });

      process.env.PROXY_URL = undefined;
    });
  });

  describe('Test closeListings endpoint', () => {
    it('should call the purge if no listings needed to get processed', async () => {
      prisma.listings.findMany = jest.fn().mockResolvedValue([
        {
          id: 'example id1',
        },
        {
          id: 'example id2',
        },
      ]);
      prisma.listings.updateMany = jest.fn().mockResolvedValue({ count: 2 });
      prisma.activityLog.createMany = jest.fn().mockResolvedValue({ count: 2 });
      prisma.cronJob.findFirst = jest
        .fn()
        .mockResolvedValue({ id: randomUUID() });
      prisma.cronJob.update = jest.fn().mockResolvedValue(true);

      process.env.PROXY_URL = 'https://www.google.com';
      await service.closeListings();
      expect(httpServiceMock.request).toHaveBeenCalledWith({
        baseURL: 'https://www.google.com',
        method: 'PURGE',
        url: `/listings?*`,
      });
      expect(prisma.listings.findMany).toHaveBeenCalledWith({
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
                lte: expect.anything(),
              },
            },
          ],
        },
      });
      expect(prisma.listings.updateMany).toHaveBeenCalledWith({
        data: {
          status: ListingsStatusEnum.closed,
          closedAt: expect.anything(),
        },
        where: {
          id: { in: ['example id1', 'example id2'] },
        },
      });
      expect(prisma.activityLog.createMany).toHaveBeenCalledWith({
        data: [
          {
            module: 'listing',
            recordId: 'example id1',
            action: 'update',
            metadata: { status: ListingsStatusEnum.closed },
          },
          {
            module: 'listing',
            recordId: 'example id2',
            action: 'update',
            metadata: { status: ListingsStatusEnum.closed },
          },
        ],
      });
      expect(prisma.cronJob.findFirst).toHaveBeenCalled();
      expect(prisma.cronJob.update).toHaveBeenCalled();
      process.env.PROXY_URL = undefined;
    });

    it('should not call the purge if no listings needed to get processed', async () => {
      prisma.listings.findMany = jest.fn().mockResolvedValue([]);
      prisma.listings.updateMany = jest.fn().mockResolvedValue({ count: 0 });
      prisma.cronJob.findFirst = jest
        .fn()
        .mockResolvedValue({ id: randomUUID() });
      prisma.cronJob.update = jest.fn().mockResolvedValue(true);

      process.env.PROXY_URL = 'https://www.google.com';
      await service.closeListings();
      expect(httpServiceMock.request).not.toHaveBeenCalled();
      expect(prisma.listings.updateMany).toHaveBeenCalledWith({
        data: {
          status: ListingsStatusEnum.closed,
          closedAt: expect.anything(),
        },
        where: {
          id: { in: [] },
        },
      });
      expect(prisma.cronJob.findFirst).toHaveBeenCalled();
      expect(prisma.cronJob.update).toHaveBeenCalled();
      process.env.PROXY_URL = undefined;
    });
  });

  describe('Test markCronJobAsStarted endpoint', () => {
    it('should create new cronjob entry if none is present', async () => {
      prisma.cronJob.findFirst = jest.fn().mockResolvedValue(null);
      prisma.cronJob.create = jest.fn().mockResolvedValue(true);

      await service.markCronJobAsStarted('LISTING_CRON_JOB');

      expect(prisma.cronJob.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'LISTING_CRON_JOB',
        },
      });
      expect(prisma.cronJob.create).toHaveBeenCalledWith({
        data: {
          lastRunDate: expect.anything(),
          name: 'LISTING_CRON_JOB',
        },
      });
    });

    it('should update cronjob entry if one is present', async () => {
      prisma.cronJob.findFirst = jest
        .fn()
        .mockResolvedValue({ id: randomUUID() });
      prisma.cronJob.update = jest.fn().mockResolvedValue(true);

      await service.markCronJobAsStarted('LISTING_CRON_JOB');

      expect(prisma.cronJob.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'LISTING_CRON_JOB',
        },
      });
      expect(prisma.cronJob.update).toHaveBeenCalledWith({
        data: {
          lastRunDate: expect.anything(),
        },
        where: {
          id: expect.anything(),
        },
      });
    });
  });

  describe('Test updateListingEvents endpoint', () => {
    it('should clear asset from listing events if they are present', async () => {
      prisma.listingEvents.findMany = jest.fn().mockResolvedValue([
        {
          id: 'random asset id',
          fileId: 'random file id',
        },
      ]);
      prisma.listingEvents.update = jest
        .fn()
        .mockResolvedValue({ success: true });
      prisma.assets.deleteMany = jest.fn().mockResolvedValue({ success: true });

      await service.updateListingEvents('random id');

      expect(prisma.listingEvents.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          fileId: true,
        },
        where: {
          listingId: 'random id',
        },
      });
      expect(prisma.listingEvents.update).toHaveBeenCalledWith({
        data: {
          assets: {
            disconnect: true,
          },
        },
        where: {
          id: 'random asset id',
        },
      });
      expect(prisma.assets.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['random file id'],
          },
        },
      });
    });

    it('should clear multiple assets from listing events if they are present', async () => {
      prisma.listingEvents.findMany = jest.fn().mockResolvedValue([
        {
          id: 'random asset id 1',
          fileId: 'random file id 1',
        },
        {
          id: 'random asset id 2',
        },
      ]);
      prisma.listingEvents.update = jest
        .fn()
        .mockResolvedValue({ success: true });
      prisma.assets.deleteMany = jest.fn().mockResolvedValue({ success: true });

      await service.updateListingEvents('random id');

      expect(prisma.listingEvents.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          fileId: true,
        },
        where: {
          listingId: 'random id',
        },
      });
      expect(prisma.listingEvents.update).toHaveBeenCalledWith({
        data: {
          assets: {
            disconnect: true,
          },
        },
        where: {
          id: 'random asset id 1',
        },
      });
      expect(prisma.listingEvents.update).toHaveBeenCalledWith({
        data: {
          assets: {
            disconnect: true,
          },
        },
        where: {
          id: 'random asset id 2',
        },
      });
      expect(prisma.assets.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['random file id 1'],
          },
        },
      });
    });

    it('should do nothing if no listing events present', async () => {
      prisma.listingEvents.findMany = jest.fn().mockResolvedValue([]);
      prisma.listingEvents.update = jest
        .fn()
        .mockResolvedValue({ success: true });
      prisma.assets.deleteMany = jest.fn().mockResolvedValue({ success: true });

      await service.updateListingEvents('random id');

      expect(prisma.listingEvents.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          fileId: true,
        },
        where: {
          listingId: 'random id',
        },
      });
      expect(prisma.listingEvents.update).not.toHaveBeenCalled();
      expect(prisma.assets.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('Test mapMarkers endpoint', () => {
    it('should find all active listings', async () => {
      prisma.listings.findMany = jest.fn().mockResolvedValue([
        {
          id: 'random id',
          listingsBuildingAddress: exampleAddress,
        },
      ]);

      await service.mapMarkers();

      expect(prisma.listings.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          listingsBuildingAddress: true,
        },
        where: {
          status: ListingsStatusEnum.active,
        },
      });
    });
  });
});
