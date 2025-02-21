import {
  LanguagesEnum,
  ListingsStatusEnum,
  MultiselectQuestionsApplicationSectionEnum,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { Listing } from '../../../src/dtos/listings/listing.dto';
import { TranslationService } from '../../../src/services/translation.service';
import { PrismaService } from '../../../src/services/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleTranslateService } from '../../../src/services/google-translate.service';
import dayjs from 'dayjs';

const mockListing = (): Listing => {
  const basicListing = {
    id: 'id 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    contentUpdatedAt: new Date(),
    name: 'listing 1',
    status: ListingsStatusEnum.active,
    displayWaitlistSize: true,
    applicationMethods: [],
    assets: [],
    events: [],
    listingsBuildingAddress: {
      id: 'address id 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      city: 'bloom city',
      state: 'Bloom',
      street: '123 main street',
      zipCode: '12345',
    },
    jurisdictions: {
      id: 'jurisdiction id 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'jurisdiction',
      languages: [],
      multiselectQuestions: [],
      publicUrl: '',
      emailFromAddress: '',
      rentalAssistanceDefault: '',
    },
    units: [],
    unitsSummarized: undefined,
    unitsSummary: [],
    showWaitlist: true,
    referralApplication: undefined,
  };
  return {
    ...basicListing,
    whatToExpect: 'untranslated what to expect',
    unitAmenities: 'untranslated unit amenities',
    specialNotes: 'untranslated special notes',
    smokingPolicy: 'untranslated smoking policy',
    servicesOffered: 'untranslated services offered',
    reservedCommunityDescription: 'untranslated reserved community description',
    requiredDocuments: 'untranslated required documents',
    rentalHistory: 'untranslated rental history',
    rentalAssistance: 'untranslated rental assistance',
    programRules: 'untranslated program rules',
    petPolicy: 'untranslated pet policy',
    neighborhood: 'untranslated neighborhood',
    leasingAgentOfficeHours: 'untranslated leasing agent office hours',
    depositMin: 'untranslated deposit minimum',
    depositMax: 'untranslated deposit maximum',
    depositHelperText: 'untranslated deposit helper text',
    criminalBackground: 'untranslated criminal background',
    creditHistory: 'untranslated credit history',
    costsNotIncluded: 'untranslated costs not included',
    applicationPickUpAddressOfficeHours:
      'untranslated application pick up address office hours',
    applicationDropOffAddressOfficeHours:
      'untranslated application drop off address office hours',
    amenities: 'untranslated amenities',
    accessibility: 'untranslated accessibility',
    referralApplication: {
      externalReference: 'untranslated external reference',
      type: 'Referral',
      id: 'referral application',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    listingMultiselectQuestions: [
      {
        multiselectQuestions: {
          id: 'multiselectQuestions id 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          text: 'untranslated multiselect text',
          description: 'untranslated multiselect description',
          subText: 'untranslated multiselect subtext',
          optOutText: 'untranslated multiselect opt out text',
          jurisdictions: [],
          applicationSection:
            MultiselectQuestionsApplicationSectionEnum.preferences,
        },
      },
    ],
    includeCommunityDisclaimer: true,
    communityDisclaimerTitle: 'untranslated community disclaimer title',
    communityDisclaimerDescription:
      'untranslated community disclaimer description',
  };
};

const translatedStrings = [
  'translated accessibility',
  'translated amenities',
  'translated application drop off address office hours',
  'translated application pick up address office hours',
  'translated costs not included',
  'translated credit history',
  'translated criminal background',
  'translated deposit helper text',
  'translated deposit maximum',
  'translated deposit minimum',
  'translated leasing agent office hours',
  'translated neighborhood',
  'translated pet policy',
  'translated program rules',
  'translated rental assistance',
  'translated rental history',
  'translated required documents',
  'translated reserved community description',
  'translated services offered',
  'translated smoking policy',
  'translated special notes',
  'translated unit amenities',
  'translated what to expect',
  'translated external reference',
  'translated multiselect text',
  'translated multiselect description',
  'translated multiselect subtext',
  'translated multiselect opt out text',
  'translated community disclaimer title',
  'translated community disclaimer description',
];

describe('Testing translations service', () => {
  let service: TranslationService;
  let prisma: PrismaService;
  let googleTranslateServiceMock;
  let mockConsoleWarn;

  beforeEach(async () => {
    googleTranslateServiceMock = {
      isConfigured: () => true,
      fetch: jest.fn(),
    };
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        PrismaService,
        {
          provide: GoogleTranslateService,
          useValue: googleTranslateServiceMock,
        },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
  });

  it('Should fall back to english if language does not exist', async () => {
    const jurisdictionId = randomUUID();
    const translations = {
      id: 'translations id 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: LanguagesEnum.en,
      jurisdictionId: jurisdictionId,
      translations: {
        translation1: 'translation 1',
        translation2: 'translation 2',
      },
    };
    // first call fails to find value so moves to the fallback
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(translations);

    const result =
      await service.getTranslationByLanguageAndJurisdictionOrDefaultEn(
        LanguagesEnum.es,
        jurisdictionId,
      );

    expect(prisma.translations.findFirst).toHaveBeenCalledTimes(2);
    expect(result).toEqual(translations);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      `Fetching translations for es failed on jurisdiction ${jurisdictionId}, defaulting to english.`,
    );
  });

  it('Should get unique translations by language and jurisdiction', async () => {
    const jurisdictionId = randomUUID();
    const translations = {
      id: 'translations id 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: LanguagesEnum.en,
      jurisdictionId: jurisdictionId,
      translations: {
        translation1: 'translation 1',
        translation2: 'translation 2',
      },
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce(translations);

    const result =
      await service.getTranslationByLanguageAndJurisdictionOrDefaultEn(
        LanguagesEnum.es,
        jurisdictionId,
      );

    expect(result).toEqual(translations);
    expect(prisma.translations.findFirst).toHaveBeenCalledTimes(1);
  });

  it('Should fetch translations and translate listing if not in db', async () => {
    googleTranslateServiceMock.fetch.mockResolvedValueOnce([translatedStrings]);
    prisma.generatedListingTranslations.findFirst = jest
      .fn()
      .mockResolvedValue(null);
    prisma.generatedListingTranslations.create = jest
      .fn()
      .mockResolvedValue(null);

    const result = await service.translateListing(
      mockListing() as Listing,
      LanguagesEnum.es,
    );
    expect(googleTranslateServiceMock.fetch).toHaveBeenCalledTimes(1);
    expect(prisma.generatedListingTranslations.findFirst).toHaveBeenCalledTimes(
      1,
    );
    expect(prisma.generatedListingTranslations.create).toHaveBeenCalledTimes(1);
    validateTranslatedFields(result);
  });

  it('Should fetch translations and translate listing if db translations outdated', async () => {
    googleTranslateServiceMock.fetch.mockResolvedValueOnce([translatedStrings]);
    prisma.generatedListingTranslations.findFirst = jest
      .fn()
      .mockResolvedValue({
        createdAt: dayjs(new Date()).subtract(1, 'days').toDate(),
        id: randomUUID(),
        translations: [translatedStrings],
      });
    prisma.generatedListingTranslations.delete = jest
      .fn()
      .mockResolvedValue(null);
    prisma.generatedListingTranslations.create = jest
      .fn()
      .mockResolvedValue(null);

    const result = await service.translateListing(
      mockListing() as Listing,
      LanguagesEnum.es,
    );
    expect(googleTranslateServiceMock.fetch).toHaveBeenCalledTimes(1);
    expect(prisma.generatedListingTranslations.findFirst).toHaveBeenCalledTimes(
      1,
    );
    expect(prisma.generatedListingTranslations.delete).toHaveBeenCalledTimes(1);
    validateTranslatedFields(result);
  });

  it('Should fetch translations from db and translate listing', async () => {
    prisma.generatedListingTranslations.findFirst = jest
      .fn()
      .mockResolvedValue({ translations: [translatedStrings] });

    const result = await service.translateListing(
      mockListing() as Listing,
      LanguagesEnum.es,
    );
    expect(googleTranslateServiceMock.fetch).toHaveBeenCalledTimes(0);
    expect(prisma.generatedListingTranslations.findFirst).toHaveBeenCalledTimes(
      1,
    );
    validateTranslatedFields(result);
  });

  it('Should get merged translations for just english and null jurisdiction', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(null);
    expect(prisma.translations.findFirst).toBeCalledTimes(1);
    expect(result).toEqual(nullJurisdiction);
  });

  it('Should get merged translations for jurisdiction in english', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    const englishJurisdictionValue = {
      value: 'jurisdiction english',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: englishJurisdictionValue })
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(randomUUID());
    expect(prisma.translations.findFirst).toBeCalledTimes(2);
    expect(result).toEqual({
      value: 'jurisdiction english',
      extraValue: 'extra value',
    });
  });
  it('Should get merged translations for just non-english and active jurisdiction', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    const englishJurisdictionValue = {
      value: 'jurisdiction english',
    };
    const spanishJurisdictionValue = {
      value: 'jurisdiction spanish',
    };
    const spanishNullValue = {
      value: 'null jurisdiction',
      extraValue: 'extra spanish',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: spanishJurisdictionValue })
      .mockResolvedValueOnce({ translations: spanishNullValue })
      .mockResolvedValueOnce({ translations: englishJurisdictionValue })
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(
      randomUUID(),
      LanguagesEnum.es,
    );
    expect(prisma.translations.findFirst).toBeCalledTimes(4);
    expect(result).toEqual({
      value: 'jurisdiction spanish',
      extraValue: 'extra spanish',
    });
  });
});

const validateTranslatedFields = (listing: Listing) => {
  expect(listing.accessibility).toEqual('translated accessibility');
  expect(listing.amenities).toEqual('translated amenities');
  expect(listing.applicationPickUpAddressOfficeHours).toEqual(
    'translated application pick up address office hours',
  );
  expect(listing.applicationDropOffAddressOfficeHours).toEqual(
    'translated application drop off address office hours',
  );
  expect(listing.costsNotIncluded).toEqual('translated costs not included');
  expect(listing.creditHistory).toEqual('translated credit history');
  expect(listing.criminalBackground).toEqual('translated criminal background');
  expect(listing.depositHelperText).toEqual('translated deposit helper text');
  expect(listing.depositMax).toEqual('translated deposit maximum');
  expect(listing.depositMin).toEqual('translated deposit minimum');
  expect(listing.leasingAgentOfficeHours).toEqual(
    'translated leasing agent office hours',
  );
  expect(listing.neighborhood).toEqual('translated neighborhood');
  expect(listing.petPolicy).toEqual('translated pet policy');
  expect(listing.programRules).toEqual('translated program rules');
  expect(listing.rentalAssistance).toEqual('translated rental assistance');
  expect(listing.rentalHistory).toEqual('translated rental history');
  expect(listing.requiredDocuments).toEqual('translated required documents');
  expect(listing.reservedCommunityDescription).toEqual(
    'translated reserved community description',
  );
  expect(listing.servicesOffered).toEqual('translated services offered');
  expect(listing.smokingPolicy).toEqual('translated smoking policy');
  expect(listing.specialNotes).toEqual('translated special notes');
  expect(listing.unitAmenities).toEqual('translated unit amenities');
  expect(listing.whatToExpect).toEqual('translated what to expect');

  expect(listing.referralApplication.externalReference).toEqual(
    'translated external reference',
  );

  expect(
    listing.listingMultiselectQuestions[0].multiselectQuestions.text,
  ).toEqual('translated multiselect text');
  expect(
    listing.listingMultiselectQuestions[0].multiselectQuestions.description,
  ).toEqual('translated multiselect description');
  expect(
    listing.listingMultiselectQuestions[0].multiselectQuestions.subText,
  ).toEqual('translated multiselect subtext');
  expect(
    listing.listingMultiselectQuestions[0].multiselectQuestions.optOutText,
  ).toEqual('translated multiselect opt out text');
  expect(listing.communityDisclaimerTitle).toEqual(
    'translated community disclaimer title',
  );
  expect(listing.communityDisclaimerDescription).toEqual(
    'translated community disclaimer description',
  );
};
