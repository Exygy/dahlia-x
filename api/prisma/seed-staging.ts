import {
  ApplicationAddressTypeEnum,
  ApplicationMethodsTypeEnum,
  ApplicationSubmissionTypeEnum,
  LanguagesEnum,
  ListingEventsTypeEnum,
  ListingsStatusEnum,
  MultiselectQuestions,
  MultiselectQuestionsApplicationSectionEnum,
  Prisma,
  PrismaClient,
  ReviewOrderTypeEnum,
  UserRoleEnum,
} from '@prisma/client';
import dayjs from 'dayjs';
import { jurisdictionFactory } from './seed-helpers/jurisdiction-factory';
import {
  featuresAndUtilites,
  listingFactory,
} from './seed-helpers/listing-factory';
import { amiChartFactory } from './seed-helpers/ami-chart-factory';
import { userFactory } from './seed-helpers/user-factory';
import { unitTypeFactoryAll } from './seed-helpers/unit-type-factory';
import { unitAccessibilityPriorityTypeFactoryAll } from './seed-helpers/unit-accessibility-priority-type-factory';
import { multiselectQuestionFactory } from './seed-helpers/multiselect-question-factory';
import {
  yellowstoneAddress,
  yosemiteAddress,
  rockyMountainAddress,
} from './seed-helpers/address-factory';
import { applicationFactory } from './seed-helpers/application-factory';
import { translationFactory } from './seed-helpers/translation-factory';
import { reservedCommunityTypeFactoryAll } from './seed-helpers/reserved-community-type-factory';
import {
  mapLayerFactory,
  redlinedMap,
  simplifiedDCMap,
} from './seed-helpers/map-layer-factory';
import { ValidationMethod } from '../src/enums/multiselect-questions/validation-method-enum';
import { randomNoun } from './seed-helpers/word-generator';
import { householdMemberFactorySingle } from './seed-helpers/household-member-factory';
import { featureFlagFactory } from './seed-helpers/feature-flag-factory';
import { FeatureFlagEnum } from '../src/enums/feature-flags/feature-flags-enum';

export const stagingSeed = async (
  prismaClient: PrismaClient,
  jurisdictionName: string,
) => {
  // create main jurisdiction
  const jurisdiction = await prismaClient.jurisdictions.create({
    data: jurisdictionFactory(jurisdictionName, [UserRoleEnum.admin]),
  });
  // add another jurisdiction
  let otherJusisName = randomNoun();
  while (otherJusisName < jurisdictionName) {
    otherJusisName = randomNoun();
  }
  const additionalJurisdiction = await prismaClient.jurisdictions.create({
    data: jurisdictionFactory(otherJusisName),
  });
  // Seed feature flags
  await prismaClient.featureFlags.create({
    data: featureFlagFactory(
      FeatureFlagEnum.enableHomeType,
      true,
      "When true, the 'Home Type' section is displayed in listing creation/edit and the public listing view",
      [jurisdiction.id],
    ),
  });
  await prismaClient.featureFlags.create({
    data: featureFlagFactory(
      FeatureFlagEnum.enableAccessibilityFeatures,
      true,
      "When true, the 'accessibility features' section is displayed in listing creation/edit and the public listing view",
      [jurisdiction.id],
    ),
  });
  await prismaClient.featureFlags.create({
    data: featureFlagFactory(
      FeatureFlagEnum.enableUtilitiesIncluded,
      true,
      "When true, the 'utilities included' section is displayed in listing creation/edit and the public listing view",
      [jurisdiction.id],
    ),
  });
  await prismaClient.featureFlags.create({
    data: featureFlagFactory(
      FeatureFlagEnum.hideCloseListingButton,
      false,
      'When true, close button is hidden on the listing edit form',
      [jurisdiction.id],
    ),
  });
  await prismaClient.featureFlags.create({
    data: featureFlagFactory(
      FeatureFlagEnum.enableUnitGroups,
      false,
      'When true, uses unit groups instead of units',
      [jurisdiction.id],
    ),
  });
  // create admin user
  await prismaClient.userAccounts.create({
    data: await userFactory({
      roles: { isAdmin: true },
      email: 'admin@example.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id, additionalJurisdiction.id],
      acceptedTerms: true,
      password: 'abcdef',
    }),
  });
  // create a jurisdictional admin
  await prismaClient.userAccounts.create({
    data: await userFactory({
      roles: { isJurisdictionalAdmin: true },
      email: 'jurisdiction-admin@example.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id],
      acceptedTerms: true,
    }),
  });
  // create a partner
  await prismaClient.userAccounts.create({
    data: await userFactory({
      roles: { isPartner: true },
      email: 'partner@example.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id],
      acceptedTerms: true,
    }),
  });
  await prismaClient.userAccounts.create({
    data: await userFactory({
      roles: { isAdmin: true },
      email: 'unverified@example.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id],
      acceptedTerms: false,
    }),
  });
  await prismaClient.userAccounts.create({
    data: await userFactory({
      roles: { isAdmin: true },
      email: 'mfauser@bloom.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id],
      acceptedTerms: true,
      mfaEnabled: true,
      singleUseCode: '12345',
    }),
  });
  await prismaClient.userAccounts.create({
    data: await userFactory({
      email: 'public-user@example.com',
      confirmedAt: new Date(),
      jurisdictionIds: [jurisdiction.id],
      password: 'abcdef',
    }),
  });
  // add jurisdiction specific translations and default ones
  await prismaClient.translations.create({
    data: translationFactory(jurisdiction.id, jurisdiction.name),
  });
  await prismaClient.translations.create({
    data: translationFactory(undefined, undefined, LanguagesEnum.es),
  });
  await prismaClient.translations.create({
    data: translationFactory(),
  });
  // build ami charts
  const amiChart = await prismaClient.amiChart.create({
    data: amiChartFactory(10, jurisdiction.id),
  });
  await prismaClient.amiChart.create({
    data: amiChartFactory(8, additionalJurisdiction.id),
  });
  // Create map layers
  await prismaClient.mapLayers.create({
    data: mapLayerFactory(jurisdiction.id, 'Redlined Districts', redlinedMap),
  });
  const mapLayer = await prismaClient.mapLayers.create({
    data: mapLayerFactory(jurisdiction.id, 'Washington DC', simplifiedDCMap),
  });
  const cityEmployeeQuestion = await prismaClient.multiselectQuestions.create({
    data: multiselectQuestionFactory(jurisdiction.id, {
      multiselectQuestion: {
        text: 'City Employees',
        description: 'Employees of the local city.',
        applicationSection:
          MultiselectQuestionsApplicationSectionEnum.preferences,
        options: [
          {
            text: 'At least one member of my household is a city employee',
            collectAddress: false,
            ordinal: 0,
          },
        ],
      },
    }),
  });
  const workInCityQuestion = await prismaClient.multiselectQuestions.create({
    data: multiselectQuestionFactory(jurisdiction.id, {
      optOut: true,
      multiselectQuestion: {
        text: 'Work in the city',
        description: 'At least one member of my household works in the city',
        applicationSection:
          MultiselectQuestionsApplicationSectionEnum.preferences,
        options: [
          {
            text: 'At least one member of my household works in the city',
            ordinal: 0,
            collectAddress: true,
            collectName: true,
            collectRelationship: true,
            mapLayerId: mapLayer.id,
            validationMethod: ValidationMethod.map,
          },
          {
            text: 'All members of the household work in the city',
            ordinal: 1,
            collectAddress: true,
            ValidationMethod: ValidationMethod.none,
            collectName: false,
            collectRelationship: false,
          },
        ],
      },
    }),
  });
  const veteranProgramQuestion = await prismaClient.multiselectQuestions.create(
    {
      data: multiselectQuestionFactory(jurisdiction.id, {
        multiselectQuestion: {
          text: 'Veteran',
          description:
            'Have you or anyone in your household served in the US military?',
          applicationSection:
            MultiselectQuestionsApplicationSectionEnum.programs,
          optOutText: 'Prefer not to say',
          options: [
            { text: 'Yes', exclusive: true, ordinal: 1 },
            { text: 'No', exclusive: true, ordinal: 2 },
          ],
        },
      }),
    },
  );
  const multiselectQuestionPrograms =
    await prismaClient.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdiction.id, {
        multiselectQuestion: {
          text: 'Housing Situation',
          description:
            'Thinking about the past 30 days, do either of these describe your housing situation?',
          applicationSection:
            MultiselectQuestionsApplicationSectionEnum.programs,
          options: [
            {
              text: 'Not Permanent',
              ordinal: 0,
            },
            {
              text: 'Homeless',
              ordinal: 1,
            },
            {
              text: 'Do Not Consider',
              ordinal: 2,
            },
            {
              text: 'Prefer not to say',
              ordinal: 3,
            },
          ],
        },
      }),
    });
  // create pre-determined values
  const unitTypes = await unitTypeFactoryAll(prismaClient);
  await unitAccessibilityPriorityTypeFactoryAll(prismaClient);
  await reservedCommunityTypeFactoryAll(jurisdiction.id, prismaClient);
  // list of predefined listings WARNING: images only work if image setup is cloudinary on exygy account
  [
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: true,
        paperApplication: false,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: null,
        buildingTotalUnits: 0,
        developer: 'Bloom',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: 'Hollywood',
        petPolicy: null,
        smokingPolicy: null,
        unitAmenities: null,
        servicesOffered: null,
        yearBuilt: null,
        applicationDueDate: null,
        applicationOpenDate: dayjs(new Date()).subtract(70, 'days').toDate(),
        applicationFee: null,
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: null,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: null,
        applicationMailingAddressType: null,
        buildingSelectionCriteria: null,
        costsNotIncluded: null,
        creditHistory: null,
        criminalBackground: null,
        depositMin: '0',
        depositMax: '0',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: false,
        leasingAgentEmail: 'bloom@exygy.com',
        leasingAgentName: 'Bloom Bloomington',
        leasingAgentOfficeHours: null,
        leasingAgentPhone: '(555) 555-5555',
        leasingAgentTitle: null,
        name: 'Hollywood Hills Heights',
        postmarkedApplicationsReceivedByDate: null,
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
        rentalHistory: null,
        requiredDocuments: null,
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.active,
        reviewOrderType: ReviewOrderTypeEnum.waitlist,
        unitsAvailable: 0,
        displayWaitlistSize: false,
        reservedCommunityDescription: null,
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: false,
        waitlistOpenSpots: null,
        customMapPin: false,
        contentUpdatedAt: new Date(),
        publishedAt: new Date(),
        listingsBuildingAddress: {
          create: yellowstoneAddress,
        },
        listingsApplicationPickUpAddress: undefined,
        listingsLeasingAgentAddress: undefined,
        listingsApplicationDropOffAddress: undefined,
        listingsApplicationMailingAddress: undefined,
        reservedCommunityTypes: undefined,
        listingImages: {
          create: {
            ordinal: 0,
            assets: {
              create: {
                label: 'cloudinaryBuilding',
                fileId: 'dev/apartment_building_2_b7ujdd',
              },
            },
          },
        },
      },
      units: [
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 0,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[0].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          numBathrooms: 1,
          numBedrooms: 1,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[1].id,
            },
          },
        },
      ],
      multiselectQuestions: [
        cityEmployeeQuestion,
        workInCityQuestion,
        multiselectQuestionPrograms,
      ],
      applications: [await applicationFactory(), await applicationFactory()],
    },
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: true,
        paperApplication: false,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: null,
        buildingTotalUnits: 0,
        developer: 'ABS Housing',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: null,
        petPolicy: 'Pets are not permitted on the property. ',
        smokingPolicy: null,
        unitAmenities: 'Each unit comes with included central AC.',
        servicesOffered: null,
        yearBuilt: 2021,
        applicationDueDate: dayjs(new Date()).add(30, 'days').toDate(),
        applicationOpenDate: dayjs(new Date()).subtract(7, 'days').toDate(),
        applicationFee: '35',
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: null,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: null,
        applicationMailingAddressType: null,
        buildingSelectionCriteria: null,
        costsNotIncluded: null,
        creditHistory: null,
        criminalBackground: null,
        depositMin: '500',
        depositMax: '0',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: false,
        leasingAgentEmail: 'sgates@abshousing.com',
        leasingAgentName: 'Samuel Gates',
        leasingAgentOfficeHours: null,
        leasingAgentPhone: '(888) 888-8888',
        leasingAgentTitle: 'Property Manager',
        name: 'District View Apartments',
        postmarkedApplicationsReceivedByDate: null,
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
        rentalHistory: null,
        requiredDocuments: null,
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.active,
        reviewOrderType: ReviewOrderTypeEnum.lottery,
        lotteryOptIn: true,
        displayWaitlistSize: false,
        reservedCommunityDescription: null,
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: false,
        waitlistOpenSpots: null,
        customMapPin: false,
        contentUpdatedAt: new Date(),
        publishedAt: new Date(),
        listingsApplicationPickUpAddress: undefined,
        listingsApplicationDropOffAddress: undefined,
        listingsApplicationMailingAddress: undefined,
        reservedCommunityTypes: undefined,
        listingEvents: {
          create: [
            {
              type: ListingEventsTypeEnum.publicLottery,
              startDate: new Date(),
              startTime: new Date(),
              endTime: new Date(),
            },
          ],
        },
        listingFeatures: undefined,
        listingUtilities: undefined,
      },
      units: [
        {
          amiPercentage: '30',
          annualIncomeMin: null,
          monthlyIncomeMin: '1985',
          floor: 2,
          maxOccupancy: 5,
          minOccupancy: 2,
          monthlyRent: '800',
          numBathrooms: 2,
          numBedrooms: 2,
          number: '',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[2].id,
            },
          },
        },
        {
          amiPercentage: '30',
          annualIncomeMin: null,
          monthlyIncomeMin: '2020',
          floor: 2,
          maxOccupancy: 5,
          minOccupancy: 2,
          monthlyRent: '800',
          numBathrooms: 2,
          numBedrooms: 2,
          number: '',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[2].id,
            },
          },
        },
        {
          amiPercentage: '30',
          annualIncomeMin: null,
          monthlyIncomeMin: '1985',
          floor: 2,
          maxOccupancy: 5,
          minOccupancy: 2,
          monthlyRent: '800',
          numBathrooms: 2,
          numBedrooms: 2,
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[2].id,
            },
          },
        },
      ],
      multiselectQuestions: [cityEmployeeQuestion],
      // has applications that are the same email and also same name/dob
      applications: [
        await applicationFactory(),
        await applicationFactory(),
        await applicationFactory({
          submissionType: ApplicationSubmissionTypeEnum.paper,
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user1@example.com',
            firstName: 'first',
            lastName: 'last',
            birthDay: 1,
            birthMonth: 1,
            birthYear: 1970,
          },
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user1@example.com',
            firstName: 'first2',
            lastName: 'last2',
            birthDay: 2,
            birthMonth: 2,
            birthYear: 1992,
          },
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user5@example.com',
            firstName: 'first2',
            lastName: 'last2',
            birthDay: 2,
            birthMonth: 2,
            birthYear: 1992,
          },
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user1@example.com',
            firstName: 'first',
            lastName: 'last',
            birthDay: 1,
            birthMonth: 1,
            birthYear: 1970,
          },
        }),
        await applicationFactory({
          applicant: { emailAddress: 'user2@example.com' },
        }),
        await applicationFactory({
          applicant: { emailAddress: 'user2@example.com' },
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user3@example.com',
            firstName: 'first3',
            lastName: 'last3',
            birthDay: 1,
            birthMonth: 1,
            birthYear: 1970,
          },
          householdMember: [
            householdMemberFactorySingle(1, {
              firstName: 'householdFirst1',
              lastName: 'householdLast1',
              birthDay: 5,
              birthMonth: 5,
              birthYear: 1950,
            }),
            householdMemberFactorySingle(2, {
              firstName: 'householdFirst2',
              lastName: 'householdLast2',
              birthDay: 8,
              birthMonth: 8,
              birthYear: 1980,
            }),
          ],
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user3@example.com',
            firstName: 'first3',
            lastName: 'last3',
            birthDay: 1,
            birthMonth: 1,
            birthYear: 1970,
          },
          householdMember: [
            householdMemberFactorySingle(1, {
              firstName: 'householdFirst1',
              lastName: 'householdLast1',
              birthDay: 5,
              birthMonth: 5,
              birthYear: 1950,
            }),
            householdMemberFactorySingle(2, {
              firstName: 'householdFirst2',
              lastName: 'householdLast2',
              birthDay: 8,
              birthMonth: 8,
              birthYear: 1980,
            }),
          ],
        }),
        await applicationFactory({
          applicant: {
            emailAddress: 'user4@example.com',
            firstName: 'first4',
            lastName: 'last4',
            birthDay: 2,
            birthMonth: 2,
            birthYear: 2002,
          },
        }),
        await applicationFactory({
          householdMember: [
            {
              firstName: 'first4',
              lastName: 'last4',
              birthDay: 2,
              birthMonth: 2,
              birthYear: 2002,
            },
          ],
        }),
      ],
    },
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: true,
        paperApplication: true,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: null,
        buildingTotalUnits: 0,
        developer: 'Cielo Housing',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: 'North End',
        petPolicy: null,
        smokingPolicy: null,
        unitAmenities: null,
        servicesOffered: null,
        yearBuilt: 1900,
        applicationDueDate: null,
        applicationOpenDate: dayjs(new Date()).subtract(1, 'days').toDate(),
        applicationFee: '60',
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: ApplicationAddressTypeEnum.leasingAgent,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: ApplicationAddressTypeEnum.leasingAgent,
        applicationMailingAddressType: ApplicationAddressTypeEnum.leasingAgent,
        applicationMethods: {
          create: {
            type: ApplicationMethodsTypeEnum.Internal,
          },
        },
        buildingSelectionCriteria: null,
        costsNotIncluded: null,
        creditHistory: null,
        criminalBackground: null,
        depositMin: '0',
        depositMax: '50',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: false,
        leasingAgentEmail: 'joe@smithrealty.com',
        leasingAgentName: 'Joe Smith',
        leasingAgentOfficeHours: '9:00am - 5:00pm, Monday-Friday',
        leasingAgentPhone: '(773) 580-5897',
        leasingAgentTitle: 'Senior Leasing Agent',
        name: 'Blue Sky Apartments',
        postmarkedApplicationsReceivedByDate: '2025-06-06T23:00:00.000Z',
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. ',
        rentalHistory: null,
        requiredDocuments: null,
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.active,
        reviewOrderType: ReviewOrderTypeEnum.firstComeFirstServe,
        displayWaitlistSize: false,
        reservedCommunityDescription:
          'Seniors over 55 are eligible for this property ',
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: false,
        waitlistOpenSpots: null,
        customMapPin: false,
        contentUpdatedAt: new Date(),
        publishedAt: new Date(),
        listingsBuildingAddress: {
          create: yellowstoneAddress,
        },
        listingsApplicationMailingAddress: {
          create: rockyMountainAddress,
        },
        listingsApplicationPickUpAddress: {
          create: yosemiteAddress,
        },
        listingsLeasingAgentAddress: {
          create: rockyMountainAddress,
        },
        listingsApplicationDropOffAddress: {
          create: yosemiteAddress,
        },
        reservedCommunityTypes: undefined,
        listingImages: {
          create: [
            {
              ordinal: 0,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/trayan-xIOYJSVEZ8c-unsplash_f1axsg',
                },
              },
            },
          ],
        },
      },
      units: [
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 1,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[1].id,
            },
          },
        },
      ],
    },
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: true,
        paperApplication: false,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: 'Includes handicap accessible entry and parking spots. ',
        buildingTotalUnits: 17,
        developer: 'ABS Housing',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: null,
        petPolicy: null,
        smokingPolicy: 'No smoking is allowed on the property.',
        unitAmenities: null,
        servicesOffered: null,
        yearBuilt: 2019,
        applicationDueDate: null,
        applicationOpenDate: dayjs(new Date()).subtract(100, 'days').toDate(),
        applicationFee: '50',
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: null,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: null,
        applicationMailingAddressType: null,
        buildingSelectionCriteria: null,
        costsNotIncluded: 'Residents are responsible for gas and electric. ',
        creditHistory: null,
        criminalBackground: null,
        depositMin: '0',
        depositMax: '0',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: false,
        leasingAgentEmail: 'valleysenior@vpm.com',
        leasingAgentName: 'Valley Property Management',
        leasingAgentOfficeHours: '10 am - 6 pm Monday through Friday',
        leasingAgentPhone: '(919) 999-9999',
        leasingAgentTitle: 'Property Manager',
        name: 'Valley Heights Senior Community',
        postmarkedApplicationsReceivedByDate: null,
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
        rentalHistory: null,
        requiredDocuments: null,
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.closed,
        reviewOrderType: ReviewOrderTypeEnum.waitlist,
        displayWaitlistSize: false,
        reservedCommunityDescription:
          'Residents must be over the age of 55 at the time of move in.',
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: false,
        waitlistOpenSpots: null,
        customMapPin: false,
        contentUpdatedAt: dayjs(new Date()).subtract(1, 'days').toDate(),
        publishedAt: dayjs(new Date()).subtract(3, 'days').toDate(),
        closedAt: dayjs(new Date()).subtract(5, 'days').toDate(),
        listingsApplicationPickUpAddress: undefined,
        listingsLeasingAgentAddress: undefined,
        listingsApplicationDropOffAddress: undefined,
        listingsApplicationMailingAddress: undefined,
        listingImages: {
          create: [
            {
              ordinal: 0,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/apartment_ez3yyz',
                },
              },
            },
            {
              ordinal: 1,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/interior_mc9erd',
                },
              },
            },
            {
              ordinal: 2,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/inside_qo9wre',
                },
              },
            },
          ],
        },
      },
    },
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: false,
        paperApplication: false,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: null,
        buildingTotalUnits: 0,
        developer: 'La Villita Listings',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: 'Koreatown',
        petPolicy: null,
        smokingPolicy: null,
        unitAmenities: null,
        servicesOffered: null,
        yearBuilt: 1996,
        applicationDueDate: null,
        applicationOpenDate: dayjs(new Date()).subtract(30, 'days').toDate(),
        applicationFee: null,
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: null,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: null,
        applicationMailingAddressType: null,
        buildingSelectionCriteria: null,
        costsNotIncluded: null,
        creditHistory: null,
        criminalBackground: null,
        depositMin: '0',
        depositMax: '0',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: false,
        leasingAgentEmail: 'joe@smith.com',
        leasingAgentName: 'Joe Smith',
        leasingAgentOfficeHours: null,
        leasingAgentPhone: '(619) 591-5987',
        leasingAgentTitle: null,
        name: 'Little Village Apartments',
        postmarkedApplicationsReceivedByDate: null,
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
        rentalHistory: null,
        requiredDocuments: null,
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.pending,
        reviewOrderType: ReviewOrderTypeEnum.waitlist,
        displayWaitlistSize: false,
        reservedCommunityDescription: null,
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: true,
        waitlistOpenSpots: 6,
        customMapPin: false,
        contentUpdatedAt: new Date(),
        publishedAt: new Date(),
        listingsApplicationPickUpAddress: undefined,
        listingsApplicationDropOffAddress: undefined,
        listingsApplicationMailingAddress: undefined,
        listingImages: {
          create: [
            {
              ordinal: 0,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/dillon-kydd-2keCPb73aQY-unsplash_lm7krp',
                },
              },
            },
          ],
        },
      },
      multiselectQuestions: [workInCityQuestion],
    },
    {
      listing: {
        additionalApplicationSubmissionNotes: null,
        digitalApplication: true,
        commonDigitalApplication: true,
        paperApplication: false,
        referralOpportunity: false,
        assets: [],
        accessibility: null,
        amenities: null,
        buildingTotalUnits: 25,
        developer: 'Johnson Realtors',
        householdSizeMax: 0,
        householdSizeMin: 0,
        neighborhood: 'Hyde Park',
        petPolicy: null,
        smokingPolicy: null,
        unitAmenities: null,
        servicesOffered: null,
        yearBuilt: 1988,
        applicationMethods: {
          create: {
            type: ApplicationMethodsTypeEnum.Internal,
          },
        },
        applicationDueDate: dayjs(new Date()).add(6, 'months').toDate(),
        applicationOpenDate: dayjs(new Date()).subtract(1, 'days').toDate(),
        applicationFee: null,
        applicationOrganization: null,
        applicationPickUpAddressOfficeHours: null,
        applicationPickUpAddressType: null,
        applicationDropOffAddressOfficeHours: null,
        applicationDropOffAddressType: null,
        applicationMailingAddressType: null,
        buildingSelectionCriteria: null,
        costsNotIncluded: null,
        creditHistory: null,
        criminalBackground: null,
        depositMin: '0',
        depositMax: '0',
        depositHelperText:
          "or one month's rent may be higher for lower credit scores",
        disableUnitsAccordion: true,
        leasingAgentEmail: 'jenny@gold.com',
        leasingAgentName: 'Jenny Gold',
        leasingAgentOfficeHours: null,
        leasingAgentPhone: '(208) 772-2856',
        leasingAgentTitle: 'Lead Agent',
        name: 'Elm Village',
        postmarkedApplicationsReceivedByDate: null,
        programRules: null,
        rentalAssistance:
          'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
        rentalHistory: null,
        requiredDocuments: 'Please bring proof of income and a recent paystub.',
        specialNotes: null,
        waitlistCurrentSize: null,
        waitlistMaxSize: null,
        whatToExpect:
          'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
        status: ListingsStatusEnum.active,
        reviewOrderType: ReviewOrderTypeEnum.lottery,
        lotteryOptIn: false,
        displayWaitlistSize: false,
        reservedCommunityDescription: null,
        reservedCommunityMinAge: null,
        resultLink: null,
        isWaitlistOpen: false,
        waitlistOpenSpots: null,
        customMapPin: false,
        contentUpdatedAt: new Date(),
        publishedAt: new Date(),
        listingsApplicationPickUpAddress: undefined,
        listingsApplicationDropOffAddress: undefined,
        reservedCommunityTypes: undefined,
        ...featuresAndUtilites(),
        listingImages: {
          create: [
            {
              ordinal: 0,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/krzysztof-hepner-V7Q0Oh3Az-c-unsplash_xoj7sr',
                },
              },
            },
            {
              ordinal: 1,
              assets: {
                create: {
                  label: 'cloudinaryBuilding',
                  fileId: 'dev/blake-wheeler-zBHU08hdzhY-unsplash_swqash',
                },
              },
            },
          ],
        },
      },
      applications: [
        await applicationFactory({
          multiselectQuestions: [workInCityQuestion, cityEmployeeQuestion],
        }),
        await applicationFactory({
          multiselectQuestions: [
            cityEmployeeQuestion,
            workInCityQuestion,
            veteranProgramQuestion,
          ],
        }),
        await applicationFactory({
          multiselectQuestions: [workInCityQuestion, cityEmployeeQuestion],
        }),
        await applicationFactory({
          multiselectQuestions: [workInCityQuestion],
        }),
        await applicationFactory({
          multiselectQuestions: [workInCityQuestion],
        }),
        await applicationFactory(),
      ],
      multiselectQuestions: [
        workInCityQuestion,
        cityEmployeeQuestion,
        veteranProgramQuestion,
      ],
      units: [
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 0,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[0].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 0,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[5].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 1,
          number: '101',
          sqFeet: '750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[1].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 1,
          numBedrooms: 2,
          number: '101',
          sqFeet: '1050.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[2].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 2,
          numBedrooms: 3,
          number: '101',
          sqFeet: '1250.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[3].id,
            },
          },
        },
        {
          amiPercentage: '30',
          monthlyIncomeMin: '2000',
          floor: 1,
          maxOccupancy: 3,
          minOccupancy: 1,
          monthlyRent: '1200',
          numBathrooms: 3,
          numBedrooms: 4,
          number: '101',
          sqFeet: '1750.00',
          amiChart: { connect: { id: amiChart.id } },
          unitTypes: {
            connect: {
              id: unitTypes[4].id,
            },
          },
        },
      ],
    },
  ].map(
    async (
      value: {
        listing: Prisma.ListingsCreateInput;
        units?: Prisma.UnitsCreateWithoutListingsInput[];
        multiselectQuestions?: MultiselectQuestions[];
        applications?: Prisma.ApplicationsCreateInput[];
      },
      index,
    ) => {
      const listing = await listingFactory(jurisdiction.id, prismaClient, {
        amiChart: amiChart,
        numberOfUnits: index,
        listing: value.listing,
        units: value.units,
        multiselectQuestions: value.multiselectQuestions,
        applications: value.applications,
        afsLastRunSetInPast: true,
      });
      const savedListing = await prismaClient.listings.create({
        data: listing,
      });
      if (index === 0) {
        await prismaClient.userAccounts.create({
          data: await userFactory({
            roles: {
              isAdmin: false,
              isPartner: true,
              isJurisdictionalAdmin: false,
            },
            email: 'partner-user@example.com',
            confirmedAt: new Date(),
            jurisdictionIds: [jurisdiction.id, additionalJurisdiction.id],
            acceptedTerms: true,
            listings: [savedListing.id],
          }),
        });
      }
    },
  );
};
