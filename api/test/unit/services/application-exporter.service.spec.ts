import { randomUUID } from 'crypto';
import { PassThrough } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { MultiselectQuestionsApplicationSectionEnum } from '@prisma/client';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../../src/services/prisma.service';
import { ApplicationCsvQueryParams } from '../../../src/dtos/applications/application-csv-query-params.dto';
import { User } from '../../../src/dtos/users/user.dto';
import MultiselectQuestion from '../../../src/dtos/multiselect-questions/multiselect-question.dto';
import { ApplicationExporterService } from '../../../src/services/application-exporter.service';
import { MultiselectQuestionService } from '../../../src/services/multiselect-question.service';
import {
  mockApplication,
  mockApplicationSet,
} from './application.service.spec';
import { mockMultiselectQuestion } from './multiselect-question.service.spec';
import { ListingService } from '../../../src/services/listing.service';
import { PermissionService } from '../../../src/services/permission.service';
import { TranslationService } from '../../../src/services/translation.service';
import { ApplicationFlaggedSetService } from '../../../src/services/application-flagged-set.service';
import { EmailService } from '../../../src/services/email.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GoogleTranslateService } from '../../../src/services/google-translate.service';
import {
  constructMultiselectQuestionHeaders,
  getExportHeaders,
  unitTypeToReadable,
} from '../../../src/utilities/application-export-helpers';

describe('Testing application export service', () => {
  let service: ApplicationExporterService;
  let prisma: PrismaService;
  let permissionService: PermissionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationExporterService,
        PrismaService,
        MultiselectQuestionService,
        ListingService,
        PermissionService,
        TranslationService,
        ApplicationFlaggedSetService,
        {
          provide: EmailService,
          useValue: {
            requestApproval: jest.fn(),
            changesRequested: jest.fn(),
            listingApproved: jest.fn(),
          },
        },
        ConfigService,
        Logger,
        SchedulerRegistry,
        GoogleTranslateService,
      ],
      imports: [HttpModule],
    }).compile();

    service = module.get<ApplicationExporterService>(
      ApplicationExporterService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  describe('csvExport', () => {
    it('should build csv without demographics', async () => {
      const requestingUser = {
        firstName: 'requesting fName',
        lastName: 'requesting lName',
        email: 'requestingUser@email.com',
        jurisdictions: [{ id: 'juris id' }],
      } as unknown as User;

      const applications = mockApplicationSet(5, new Date(), 1);
      prisma.applications.findMany = jest.fn().mockReturnValue(applications);
      prisma.listings.findUnique = jest.fn().mockResolvedValue({});
      permissionService.canOrThrow = jest.fn().mockResolvedValue(true);

      prisma.multiselectQuestions.findMany = jest.fn().mockReturnValue([
        {
          ...mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
          options: [
            { id: 1, text: 'text' },
            { id: 2, text: 'text', collectAddress: true },
          ],
        },
        {
          ...mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
          options: [{ id: 1, text: 'text' }],
        },
      ]);

      const exportResponse = await service.csvExport(
        {
          listingId: randomUUID(),
          includeDemographics: false,
        } as unknown as ApplicationCsvQueryParams,
        requestingUser.id,
      );

      const headerRow =
        '"Application Id","Application Confirmation Code","Application Type","Application Submission Date","Primary Applicant First Name","Primary Applicant Middle Name","Primary Applicant Last Name","Primary Applicant Birth Day","Primary Applicant Birth Month","Primary Applicant Birth Year","Primary Applicant Email Address","Primary Applicant Phone Number","Primary Applicant Phone Type","Primary Applicant Additional Phone Number","Primary Applicant Preferred Contact Type","Primary Applicant Street","Primary Applicant Street 2","Primary Applicant City","Primary Applicant State","Primary Applicant Zip Code","Primary Applicant Mailing Street","Primary Applicant Mailing Street 2","Primary Applicant Mailing City","Primary Applicant Mailing State","Primary Applicant Mailing Zip Code","Primary Applicant Work Street","Primary Applicant Work Street 2","Primary Applicant Work City","Primary Applicant Work State","Primary Applicant Work Zip Code","Alternate Contact First Name","Alternate Contact Last Name","Alternate Contact Type","Alternate Contact Agency","Alternate Contact Other Type","Alternate Contact Email Address","Alternate Contact Phone Number","Alternate Contact Street","Alternate Contact Street 2","Alternate Contact City","Alternate Contact State","Alternate Contact Zip Code","Income","Income Period","Accessibility Mobility","Accessibility Vision","Accessibility Hearing","Expecting Household Changes","Household Includes Student or Member Nearing 18","Vouchers or Subsidies","Requested Unit Types","Preference text 0","Preference text 0 - text - Address","Program text 1","Household Size","Household Member (1) First Name","Household Member (1) Middle Name","Household Member (1) Last Name","Household Member (1) First Name","Household Member (1) Birth Day","Household Member (1) Birth Month","Household Member (1) Birth Year","Household Member (1) Same as Primary Applicant","Household Member (1) Relationship","Household Member (1) Work in Region","Household Member (1) Street","Household Member (1) Street 2","Household Member (1) City","Household Member (1) State","Household Member (1) Zip Code","Marked As Duplicate","Flagged As Duplicate"';
      const firstApp =
        '"application 0 firstName","application 0 middleName","application 0 lastName","application 0 birthDay","application 0 birthMonth","application 0 birthYear","application 0 emailaddress","application 0 phoneNumber","application 0 phoneNumberType","additionalPhoneNumber 0",,"application 0 applicantAddress street","application 0 applicantAddress street2","application 0 applicantAddress city","application 0 applicantAddress state","application 0 applicantAddress zipCode","application 0 mailingAddress street","application 0 mailingAddress street2","application 0 mailingAddress city","application 0 mailingAddress state","application 0 mailingAddress zipCode","application 0 applicantWorkAddress street","application 0 applicantWorkAddress street2","application 0 applicantWorkAddress city","application 0 applicantWorkAddress state","application 0 applicantWorkAddress zipCode","application 0 alternateContact firstName","application 0 alternateContact lastName","application 0 alternateContact type","application 0 alternateContact agency","application 0 alternateContact otherType","application 0 alternatecontact emailaddress","application 0 alternateContact phoneNumber","application 0 alternateContact address street","application 0 alternateContact address street2","application 0 alternateContact address city","application 0 alternateContact address state","application 0 alternateContact address zipCode","income 0","per month",,,,"true","true","true","Studio,One Bedroom",,,,,,,,,,,,,,,,,,,,,';

      const mockedStream = new PassThrough();
      exportResponse.pipe(mockedStream);

      // In order to make sure the last expect statements are properly hit we need to wrap in a promise and resolve it
      const readable = await new Promise((resolve) => {
        mockedStream.on('data', async (d) => {
          const value = Buffer.from(d).toString();
          mockedStream.end();
          mockedStream.destroy();
          resolve(value);
        });
      });

      expect(readable).toContain(headerRow);
      expect(readable).toContain(firstApp);
    });

    it('should build csv with demographics', async () => {
      const requestingUser = {
        firstName: 'requesting fName',
        lastName: 'requesting lName',
        email: 'requestingUser@email.com',
        jurisdictions: [{ id: 'juris id' }],
      } as unknown as User;

      const applications = mockApplicationSet(3, new Date());
      prisma.applications.findMany = jest.fn().mockReturnValue(applications);
      prisma.listings.findUnique = jest.fn().mockResolvedValue({});
      permissionService.canOrThrow = jest.fn().mockResolvedValue(true);

      prisma.multiselectQuestions.findMany = jest
        .fn()
        .mockReturnValue([
          mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
          mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
        ]);

      const exportResponse = await service.csvExport(
        {
          listingId: 'test',
          includeDemographics: true,
        } as unknown as ApplicationCsvQueryParams,
        requestingUser.id,
      );

      const headerRow =
        '"Application Id","Application Confirmation Code","Application Type","Application Submission Date","Primary Applicant First Name","Primary Applicant Middle Name","Primary Applicant Last Name","Primary Applicant Birth Day","Primary Applicant Birth Month","Primary Applicant Birth Year","Primary Applicant Email Address","Primary Applicant Phone Number","Primary Applicant Phone Type","Primary Applicant Additional Phone Number","Primary Applicant Preferred Contact Type","Primary Applicant Street","Primary Applicant Street 2","Primary Applicant City","Primary Applicant State","Primary Applicant Zip Code","Primary Applicant Mailing Street","Primary Applicant Mailing Street 2","Primary Applicant Mailing City","Primary Applicant Mailing State","Primary Applicant Mailing Zip Code","Primary Applicant Work Street","Primary Applicant Work Street 2","Primary Applicant Work City","Primary Applicant Work State","Primary Applicant Work Zip Code","Alternate Contact First Name","Alternate Contact Last Name","Alternate Contact Type","Alternate Contact Agency","Alternate Contact Other Type","Alternate Contact Email Address","Alternate Contact Phone Number","Alternate Contact Street","Alternate Contact Street 2","Alternate Contact City","Alternate Contact State","Alternate Contact Zip Code","Income","Income Period","Accessibility Mobility","Accessibility Vision","Accessibility Hearing","Expecting Household Changes","Household Includes Student or Member Nearing 18","Vouchers or Subsidies","Requested Unit Types","Preference text 0","Program text 1","Household Size","Marked As Duplicate","Flagged As Duplicate","Ethnicity","Race","How did you Hear?"';
      const firstApp =
        '"application 0 firstName","application 0 middleName","application 0 lastName","application 0 birthDay","application 0 birthMonth","application 0 birthYear","application 0 emailaddress","application 0 phoneNumber","application 0 phoneNumberType","additionalPhoneNumber 0",,"application 0 applicantAddress street","application 0 applicantAddress street2","application 0 applicantAddress city","application 0 applicantAddress state","application 0 applicantAddress zipCode","application 0 mailingAddress street","application 0 mailingAddress street2","application 0 mailingAddress city","application 0 mailingAddress state","application 0 mailingAddress zipCode","application 0 applicantWorkAddress street","application 0 applicantWorkAddress street2","application 0 applicantWorkAddress city","application 0 applicantWorkAddress state","application 0 applicantWorkAddress zipCode","application 0 alternateContact firstName","application 0 alternateContact lastName","application 0 alternateContact type","application 0 alternateContact agency","application 0 alternateContact otherType","application 0 alternatecontact emailaddress","application 0 alternateContact phoneNumber","application 0 alternateContact address street","application 0 alternateContact address street2","application 0 alternateContact address city","application 0 alternateContact address state","application 0 alternateContact address zipCode","income 0","per month",,,,"true","true","true","Studio,One Bedroom",,,,,,,"Decline to Respond"';

      const mockedStream = new PassThrough();
      exportResponse.pipe(mockedStream);
      const readable = await new Promise((resolve) => {
        mockedStream.on('data', async (d) => {
          const value = Buffer.from(d).toString();
          mockedStream.end();
          mockedStream.destroy();
          resolve(value);
        });
      });

      expect(readable).toContain(headerRow);
      expect(readable).toContain(firstApp);
    });

    it('should build csv with submission date defaulted to TIME_ZONE variable', async () => {
      process.env.TIME_ZONE = 'America/Los_Angeles';
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));

      const requestingUser = {
        firstName: 'requesting fName',
        lastName: 'requesting lName',
        email: 'requestingUser@email.com',
        jurisdictions: [{ id: 'juris id' }],
      } as unknown as User;

      const applications = mockApplicationSet(5, new Date());
      prisma.applications.findMany = jest.fn().mockReturnValue(applications);
      prisma.listings.findUnique = jest.fn().mockResolvedValue({});
      permissionService.canOrThrow = jest.fn().mockResolvedValue(true);

      prisma.multiselectQuestions.findMany = jest.fn().mockReturnValue([
        {
          ...mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
          options: [
            { id: 1, text: 'text' },
            { id: 2, text: 'text', collectAddress: true },
          ],
        },
        {
          ...mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
          options: [{ id: 1, text: 'text' }],
        },
      ]);

      jest
        .spyOn({ unitTypeToReadable }, 'unitTypeToReadable')
        .mockReturnValue('Studio');
      const exportResponse = await service.csvExport(
        { listingId: randomUUID() } as unknown as ApplicationCsvQueryParams,
        requestingUser.id,
      );

      const mockedStream = new PassThrough();
      exportResponse.pipe(mockedStream);

      // In order to make sure the last expect statements are properly hit we need to wrap in a promise and resolve it
      const readable = await new Promise((resolve) => {
        mockedStream.on('data', async (d) => {
          const value = Buffer.from(d).toString();
          mockedStream.end();
          mockedStream.destroy();
          resolve(value);
        });
      });

      expect(readable).toContain('PST');
    });

    it('should build csv with submission date in custom timezone', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));

      const requestingUser = {
        firstName: 'requesting fName',
        lastName: 'requesting lName',
        email: 'requestingUser@email.com',
        jurisdictions: [{ id: 'juris id' }],
      } as unknown as User;

      const applications = mockApplicationSet(5, new Date());
      prisma.applications.findMany = jest.fn().mockReturnValue(applications);
      prisma.listings.findUnique = jest.fn().mockResolvedValue({});
      permissionService.canOrThrow = jest.fn().mockResolvedValue(true);

      prisma.multiselectQuestions.findMany = jest.fn().mockReturnValue([
        {
          ...mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
          options: [
            { id: 1, text: 'text' },
            { id: 2, text: 'text', collectAddress: true },
          ],
        },
        {
          ...mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
          options: [{ id: 1, text: 'text' }],
        },
      ]);

      jest
        .spyOn({ unitTypeToReadable }, 'unitTypeToReadable')
        .mockReturnValue('Studio');
      const exportResponse = await service.csvExport(
        {
          listingId: randomUUID(),
          timeZone: 'America/New_York',
        } as unknown as ApplicationCsvQueryParams,
        requestingUser.id,
      );

      const mockedStream = new PassThrough();
      exportResponse.pipe(mockedStream);

      // In order to make sure the last expect statements are properly hit we need to wrap in a promise and resolve it
      const readable = await new Promise((resolve) => {
        mockedStream.on('data', async (d) => {
          const value = Buffer.from(d).toString();
          mockedStream.end();
          mockedStream.destroy();
          resolve(value);
        });
      });

      expect(readable).toContain('EST');
    });

    it('should build csv when application has null programs', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));

      const requestingUser = {
        firstName: 'requesting fName',
        lastName: 'requesting lName',
        email: 'requestingUser@email.com',
        jurisdictions: [{ id: 'juris id' }],
      } as unknown as User;

      const applications = mockApplicationSet(5, new Date());
      applications.forEach((app) => {
        app.programs = null;
      });
      prisma.applications.findMany = jest.fn().mockReturnValue(applications);
      prisma.listings.findUnique = jest.fn().mockResolvedValue({});
      permissionService.canOrThrow = jest.fn().mockResolvedValue(true);

      prisma.multiselectQuestions.findMany = jest.fn().mockReturnValue([
        {
          ...mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
          options: [
            { id: 1, text: 'text' },
            { id: 2, text: 'text', collectAddress: true },
          ],
        },
        {
          ...mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
          options: [{ id: 1, text: 'text' }],
        },
      ]);

      jest
        .spyOn({ unitTypeToReadable }, 'unitTypeToReadable')
        .mockReturnValue('Studio');
      const exportResponse = await service.csvExport(
        {
          listingId: randomUUID(),
          timeZone: 'America/New_York',
        } as unknown as ApplicationCsvQueryParams,
        requestingUser.id,
      );

      const mockedStream = new PassThrough();
      exportResponse.pipe(mockedStream);

      // In order to make sure the last expect statements are properly hit we need to wrap in a promise and resolve it
      const readable = await new Promise((resolve) => {
        mockedStream.on('data', async (d) => {
          const value = Buffer.from(d).toString();
          mockedStream.end();
          mockedStream.destroy();
          resolve(value);
        });
      });

      expect(readable).toContain('EST');
    });
  });

  describe('sortPreferencesByOrdinal', () => {
    it('should sort listing preferences by ordinal', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01'));

      const unsortedPreferences = [
        {
          ...mockMultiselectQuestion(
            0,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
        },
        {
          ...mockMultiselectQuestion(
            1,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.preferences,
          ),
        },
        {
          ...mockMultiselectQuestion(
            2,
            new Date(),
            MultiselectQuestionsApplicationSectionEnum.programs,
          ),
          options: [{ id: 1, text: 'text' }],
        },
      ] as MultiselectQuestion[];

      const listingId = randomUUID();

      prisma.listingMultiselectQuestions.findMany = jest.fn().mockReturnValue([
        {
          listingId,
          multiselectQuestionId: unsortedPreferences[1].id,
          ordinal: 1,
        },
        {
          listingId,
          multiselectQuestionId: unsortedPreferences[0].id,
          ordinal: 2,
        },
      ]);

      const sortedPreferences = await service.sortPreferencesByOrdinal(
        unsortedPreferences,
        listingId,
      );
      expect(sortedPreferences[0].text).toEqual('text 1');
      expect(sortedPreferences[1].text).toEqual('text 0');
    });
  });

  describe('populateDataForEachHeader', () => {
    it('should populate the data for each header and output a string', async () => {
      const headers = await getExportHeaders(0, [], process.env.TIME_ZONE);
      const id = randomUUID();
      const application = mockApplication({
        date: new Date('December 5, 2024 03:24:00'),
        position: 1,
        id,
        includeFlagSets: true,
      });
      const { stringData, objectData } =
        await service.populateDataForEachHeader(headers, application, '');

      expect(objectData).toBe(undefined);
      expect(stringData).toEqual(
        `"${id.toString()}","confirmationCode 1","electronic","12-05-2024 01:24:00AM PST","application 1 firstName","application 1 middleName","application 1 lastName","application 1 birthDay","application 1 birthMonth","application 1 birthYear","application 1 emailaddress","application 1 phoneNumber","application 1 phoneNumberType","additionalPhoneNumber 1",,"application 1 applicantAddress street","application 1 applicantAddress street2","application 1 applicantAddress city","application 1 applicantAddress state","application 1 applicantAddress zipCode","application 1 mailingAddress street","application 1 mailingAddress street2","application 1 mailingAddress city","application 1 mailingAddress state","application 1 mailingAddress zipCode","application 1 applicantWorkAddress street","application 1 applicantWorkAddress street2","application 1 applicantWorkAddress city","application 1 applicantWorkAddress state","application 1 applicantWorkAddress zipCode","application 1 alternateContact firstName","application 1 alternateContact lastName","application 1 alternateContact type","application 1 alternateContact agency","application 1 alternateContact otherType","application 1 alternatecontact emailaddress","application 1 alternateContact phoneNumber","application 1 alternateContact address street","application 1 alternateContact address street2","application 1 alternateContact address city","application 1 alternateContact address state","application 1 alternateContact address zipCode","income 1","per month",,,,"true","true","true","Studio,One Bedroom","1","true","true"`,
      );
    });
    it('should populate the data for each header and output a string', async () => {
      const headers = await getExportHeaders(0, [], process.env.TIME_ZONE);
      const id = randomUUID();
      const application = mockApplication({
        date: new Date('December 5, 2024 03:24:00'),
        position: 1,
        id,
        includeFlagSets: true,
      });
      const { stringData, objectData } =
        await service.populateDataForEachHeader(
          headers,
          application,
          undefined,
          {},
        );

      expect(objectData).toEqual({
        'accessibility.hearing': '',
        'accessibility.mobility': '',
        'accessibility.vision': '',
        additionalPhoneNumber: 'additionalPhoneNumber 1',
        'alternateContact.address.city':
          'application 1 alternateContact address city',
        'alternateContact.address.state':
          'application 1 alternateContact address state',
        'alternateContact.address.street':
          'application 1 alternateContact address street',
        'alternateContact.address.street2':
          'application 1 alternateContact address street2',
        'alternateContact.address.zipCode':
          'application 1 alternateContact address zipCode',
        'alternateContact.agency': 'application 1 alternateContact agency',
        'alternateContact.emailAddress':
          'application 1 alternatecontact emailaddress',
        'alternateContact.firstName':
          'application 1 alternateContact firstName',
        'alternateContact.lastName': 'application 1 alternateContact lastName',
        'alternateContact.otherType':
          'application 1 alternateContact otherType',
        'alternateContact.phoneNumber':
          'application 1 alternateContact phoneNumber',
        'alternateContact.type': 'application 1 alternateContact type',
        'applicant.applicantAddress.city':
          'application 1 applicantAddress city',
        'applicant.applicantAddress.state':
          'application 1 applicantAddress state',
        'applicant.applicantAddress.street':
          'application 1 applicantAddress street',
        'applicant.applicantAddress.street2':
          'application 1 applicantAddress street2',
        'applicant.applicantAddress.zipCode':
          'application 1 applicantAddress zipCode',
        'applicant.applicantWorkAddress.city':
          'application 1 applicantWorkAddress city',
        'applicant.applicantWorkAddress.state':
          'application 1 applicantWorkAddress state',
        'applicant.applicantWorkAddress.street':
          'application 1 applicantWorkAddress street',
        'applicant.applicantWorkAddress.street2':
          'application 1 applicantWorkAddress street2',
        'applicant.applicantWorkAddress.zipCode':
          'application 1 applicantWorkAddress zipCode',
        'applicant.birthDay': 'application 1 birthDay',
        'applicant.birthMonth': 'application 1 birthMonth',
        'applicant.birthYear': 'application 1 birthYear',
        'applicant.emailAddress': 'application 1 emailaddress',
        'applicant.firstName': 'application 1 firstName',
        'applicant.lastName': 'application 1 lastName',
        'applicant.middleName': 'application 1 middleName',
        'applicant.phoneNumber': 'application 1 phoneNumber',
        'applicant.phoneNumberType': 'application 1 phoneNumberType',
        applicationFlaggedSet: 'true',
        'applicationsMailingAddress.city': 'application 1 mailingAddress city',
        'applicationsMailingAddress.state':
          'application 1 mailingAddress state',
        'applicationsMailingAddress.street':
          'application 1 mailingAddress street',
        'applicationsMailingAddress.street2':
          'application 1 mailingAddress street2',
        'applicationsMailingAddress.zipCode':
          'application 1 mailingAddress zipCode',
        confirmationCode: 'confirmationCode 1',
        contactPreferences: '',
        householdExpectingChanges: 'true',
        householdSize: '1',
        householdStudent: 'true',
        id: id,
        income: 'income 1',
        incomePeriod: 'per month',
        incomeVouchers: 'true',
        markedAsDuplicate: 'true',
        preferredUnitTypes: 'Studio,One Bedroom',
        submissionDate: '12-05-2024 01:24:00AM PST',
        submissionType: 'electronic',
      });
      expect(stringData).toEqual(undefined);
    });
    it('should parse the preference data', async () => {
      const multiselectQuestionId = randomUUID();
      const multiselectQuestionId2 = randomUUID();
      const multiselectQuestion: MultiselectQuestion = {
        id: multiselectQuestionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        text: 'first preference title',
        jurisdictions: [{ id: randomUUID() }],
        applicationSection:
          MultiselectQuestionsApplicationSectionEnum.preferences,
        options: [
          {
            text: 'option 1 text',
            ordinal: 1,
            collectAddress: true,
            collectName: true,
            collectRelationship: true,
          },
          {
            text: 'option 2. text',
            ordinal: 2,
            collectAddress: true,
            collectName: true,
            collectRelationship: true,
          },
          { text: 'option 3 text', ordinal: 2 },
        ],
        optOutText: 'I am opting out',
      };
      const multiselectQuestion2: MultiselectQuestion = {
        id: multiselectQuestionId2,
        createdAt: new Date(),
        updatedAt: new Date(),
        text: 'second. preference title',
        jurisdictions: [{ id: randomUUID() }],
        applicationSection:
          MultiselectQuestionsApplicationSectionEnum.preferences,
        options: [
          {
            text: 'not selected',
            ordinal: 1,
          },
        ],
        optOutText: 'I am opting out!',
      };
      const headers = await constructMultiselectQuestionHeaders(
        'preferences',
        'Preference',
        [multiselectQuestion, multiselectQuestion2],
      );
      const application = {
        preferences: [
          {
            multiselectQuestionId: multiselectQuestionId,
            key: 'second. preference title',
            claimed: true,
            options: [
              { key: 'option 1 text', checked: false },
              {
                key: 'option 2. text',
                checked: true,
                extraData: [
                  {
                    key: 'address',
                    type: 'address',
                    value: {
                      city: 'West Glacier',
                      state: 'MT',
                      county: 'Glacier County',
                      street: '64 Grinnell Dr',
                      zipCode: '59936',
                      latitude: 53.7487218,
                      longitude: -142.0251025,
                      placeName: 'Glacier National Park',
                    },
                  },
                ],
              },
              { key: 'option 3 text', checked: true },
            ],
          },
          {
            multiselectQuestionId: multiselectQuestionId2,
            key: 'first preference title',
            claimed: true,
            options: [
              { key: 'not selected', checked: false },
              { key: 'I am opting out!', checked: true },
            ],
          },
        ],
      };
      const { stringData, objectData } =
        await service.populateDataForEachHeader(headers, application, '');

      expect(objectData).toBe(undefined);
      expect(stringData).toEqual(
        '"option 2. text, option 3 text",,,,"64 Grinnell Dr West Glacier, MT 59936",,,"I am opting out!"',
      );
    });
  });
});
