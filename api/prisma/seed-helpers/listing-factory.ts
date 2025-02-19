import {
  AmiChart,
  ApplicationMethodsTypeEnum,
  ListingsStatusEnum,
  LotteryStatusEnum,
  MultiselectQuestions,
  Prisma,
  PrismaClient,
  ReservedCommunityTypes,
  ReviewOrderTypeEnum,
} from '@prisma/client';
import { randomInt } from 'crypto';
import { randomName } from './word-generator';
import { addressFactory } from './address-factory';
import { reservedCommunityTypesFindOrCreate } from './reserved-community-type-factory';
import { unitFactoryMany } from './unit-factory';
import { randomBoolean } from './boolean-generator';

const cloudinaryIds = [
  'dev/blake-wheeler-zBHU08hdzhY-unsplash_swqash',
  'dev/krzysztof-hepner-V7Q0Oh3Az-c-unsplash_xoj7sr',
  'dev/dillon-kydd-2keCPb73aQY-unsplash_lm7krp',
  'dev/inside_qo9wre',
  'dev/interior_mc9erd',
  'dev/apartment_ez3yyz',
  'dev/trayan-xIOYJSVEZ8c-unsplash_f1axsg',
  'dev/apartment_building_2_b7ujdd',
];

type optionalFeatures = {
  elevator?: boolean;
  wheelchairRamp?: boolean;
  serviceAnimalsAllowed?: boolean;
  accessibleParking?: boolean;
  parkingOnSite?: boolean;
  inUnitWasherDryer?: boolean;
  laundryInBuilding?: boolean;
  barrierFreeEntrance?: boolean;
  rollInShower?: boolean;
  grabBars?: boolean;
  heatingInUnit?: boolean;
  acInUnit?: boolean;
  hearing?: boolean;
  visual?: boolean;
  mobility?: boolean;
  barrierFreeUnitEntrance?: boolean;
  loweredLightSwitch?: boolean;
  barrierFreeBathroom?: boolean;
  wideDoorways?: boolean;
  loweredCabinets?: boolean;
};

type optionalUtilities = {
  water?: boolean;
  gas?: boolean;
  trash?: boolean;
  sewer?: boolean;
  electricity?: boolean;
  cable?: boolean;
  phone?: boolean;
  internet?: boolean;
};

export const listingFactory = async (
  jurisdictionId: string,
  prismaClient: PrismaClient,
  optionalParams?: {
    afsLastRunSetInPast?: boolean;
    amiChart?: AmiChart;
    applications?: Prisma.ApplicationsCreateInput[];
    applicationDueDate?: Date;
    closedAt?: Date;
    digitalApp?: boolean;
    includeBuildingFeatures?: boolean;
    includeEligibilityRules?: boolean;
    includeReservedCommunityTypes?: boolean;
    listing?: Prisma.ListingsCreateInput;
    listingEvents?: Prisma.ListingEventsCreateWithoutListingsInput[];
    lotteryOptIn?: boolean;
    lotteryStatus?: LotteryStatusEnum;
    multiselectQuestions?: Partial<MultiselectQuestions>[];
    noImage?: boolean;
    numberOfUnits?: number;
    optionalFeatures?: optionalFeatures;
    optionalUtilities?: optionalUtilities;
    reviewOrderType?: ReviewOrderTypeEnum;
    status?: ListingsStatusEnum;
    units?: Prisma.UnitsCreateWithoutListingsInput[];
  },
): Promise<Prisma.ListingsCreateInput> => {
  const previousListing = optionalParams?.listing || {};
  let units = optionalParams?.units;
  if (!units && optionalParams?.numberOfUnits) {
    units = await unitFactoryMany(optionalParams.numberOfUnits, prismaClient, {
      randomizePriorityType: true,
      amiChart: optionalParams?.amiChart,
    });
  }

  let reservedCommunityType: ReservedCommunityTypes;
  if (
    optionalParams?.includeReservedCommunityTypes ||
    (optionalParams?.includeReservedCommunityTypes ?? Math.random() < 0.5)
  ) {
    reservedCommunityType = await reservedCommunityTypesFindOrCreate(
      jurisdictionId,
      prismaClient,
    );
  }

  const digitalApp = optionalParams?.digitalApp ?? Math.random() < 0.5;

  return {
    // For application flagged set tests the date needs to be before the updated timestamp
    // All others should be a newer timestamp so that they are not picked up by AFS tests
    afsLastRunAt: optionalParams?.afsLastRunSetInPast
      ? new Date(0)
      : new Date(),
    applicationDueDate: optionalParams?.applicationDueDate ?? undefined,
    assets: [],
    closedAt: optionalParams?.closedAt
      ? optionalParams?.closedAt
      : optionalParams?.status === ListingsStatusEnum.closed
      ? new Date()
      : null,
    commonDigitalApplication: digitalApp,
    createdAt: new Date(),
    developer: randomName(),
    digitalApplication: digitalApp,
    displayWaitlistSize: Math.random() < 0.5,
    leasingAgentEmail: 'leasing-agent@example.com',
    leasingAgentName: randomName(),
    leasingAgentPhone: '515-604-0183',
    lotteryOptIn: optionalParams?.lotteryOptIn || undefined,
    lotteryStatus: optionalParams?.lotteryStatus || undefined,
    name: randomName(),
    paperApplication: Math.random() < 0.5,
    referralOpportunity: Math.random() < 0.5,
    reviewOrderType: optionalParams?.reviewOrderType ?? undefined,
    status: optionalParams?.status || ListingsStatusEnum.active,
    unitsAvailable: units?.length || 0,

    applicationMethods: digitalApp
      ? {
          create: {
            type: ApplicationMethodsTypeEnum.Internal,
          },
        }
      : {},
    applications: optionalParams?.applications
      ? {
          create: optionalParams.applications,
        }
      : undefined,
    jurisdictions: {
      connect: {
        id: jurisdictionId,
      },
    },
    listingsApplicationDropOffAddress: {
      create: addressFactory(),
    },
    listingsApplicationMailingAddress: {
      create: addressFactory(),
    },
    listingsApplicationPickUpAddress: {
      create: addressFactory(),
    },
    listingsBuildingAddress: {
      create: addressFactory(),
    },
    listingEvents: optionalParams?.listingEvents
      ? {
          create: optionalParams.listingEvents,
        }
      : undefined,
    listingImages: !optionalParams?.noImage
      ? {
          create: {
            ordinal: 0,
            assets: {
              create: {
                label: 'cloudinaryBuilding',
                fileId: cloudinaryIds[randomInt(cloudinaryIds.length)],
              },
            },
          },
        }
      : {},
    listingsLeasingAgentAddress: {
      create: addressFactory(),
    },
    listingMultiselectQuestions: optionalParams?.multiselectQuestions
      ? {
          create: [
            ...optionalParams?.multiselectQuestions
              ?.filter(
                (question) => question.applicationSection === 'preferences',
              )
              .map((question, index) => ({
                multiselectQuestions: {
                  connect: {
                    id: question.id,
                  },
                },
                ordinal: index + 1,
              })),
            ...optionalParams?.multiselectQuestions
              ?.filter((question) => question.applicationSection === 'programs')
              .map((question, index) => ({
                multiselectQuestions: {
                  connect: {
                    id: question.id,
                  },
                },
                ordinal: index + 1,
              })),
          ],
        }
      : undefined,
    reservedCommunityTypes: reservedCommunityType
      ? {
          connect: {
            id: reservedCommunityType.id,
          },
        }
      : {},
    units: units
      ? {
          create: units,
        }
      : undefined,

    ...additionalEligibilityRules(optionalParams?.includeEligibilityRules),
    ...buildingFeatures(optionalParams?.includeBuildingFeatures),
    ...featuresAndUtilites(
      optionalParams?.optionalFeatures,
      optionalParams?.optionalUtilities,
    ),
    ...previousListing,
  };
};

const additionalEligibilityRules = (includeEligibilityRules: boolean) => {
  if (!includeEligibilityRules) return {};
  return {
    rentalHistory: 'Two years of rental history will be verified',
    rentalAssistance: 'additional rental assistance',
    creditHistory:
      'A poor credit history may be grounds to deem an applicant ineligible for housing.',
    criminalBackground:
      'A criminal background investigation will be obtained on each applicant.  As criminal background checks are done county by county and will be ran for all counties in which the applicant lived,  Applicants will be disqualified for tenancy if they have been convicted of a felony or misdemeanor.  Refer to Tenant Selection Criteria or Qualification Criteria for details related to the qualification process. ',
  };
};

const buildingFeatures = (includeBuildingFeatures: boolean) => {
  if (!includeBuildingFeatures) return {};
  return {
    amenities:
      'Laundry facilities, Elevators, Beautifully landscaped garden, walkways',
    unitAmenities: 'All-electric kitchen, Dishwasher',
    petPolicy: 'Allow pets with a deposit of $500',
    accessibility: 'ADA units available',
    smokingPolicy: 'Non-smoking building',
    servicesOffered: 'Resident services on-site.',
  };
};

export const featuresAndUtilites = (
  optionalFeatures?: optionalFeatures,
  optionalUtilities?: optionalUtilities,
): {
  listingFeatures: Prisma.ListingFeaturesCreateNestedOneWithoutListingsInput;
  listingUtilities: Prisma.ListingUtilitiesCreateNestedOneWithoutListingsInput;
} => ({
  listingFeatures: {
    create: {
      elevator: randomBoolean(),
      wheelchairRamp: randomBoolean(),
      serviceAnimalsAllowed: randomBoolean(),
      accessibleParking: randomBoolean(),
      parkingOnSite: randomBoolean(),
      inUnitWasherDryer: randomBoolean(),
      laundryInBuilding: randomBoolean(),
      barrierFreeEntrance: randomBoolean(),
      rollInShower: randomBoolean(),
      grabBars: randomBoolean(),
      heatingInUnit: randomBoolean(),
      acInUnit: randomBoolean(),
      hearing: randomBoolean(),
      visual: randomBoolean(),
      mobility: randomBoolean(),
      barrierFreeUnitEntrance: randomBoolean(),
      loweredLightSwitch: randomBoolean(),
      barrierFreeBathroom: randomBoolean(),
      wideDoorways: randomBoolean(),
      loweredCabinets: randomBoolean(),
      ...optionalFeatures,
    },
  },
  listingUtilities: {
    create: {
      water: randomBoolean(),
      gas: randomBoolean(),
      trash: randomBoolean(),
      sewer: randomBoolean(),
      electricity: randomBoolean(),
      cable: randomBoolean(),
      phone: randomBoolean(),
      internet: randomBoolean(),
      ...optionalUtilities,
    },
  },
});
