import { Test, TestingModule } from '@nestjs/testing';
import {
  LanguagesEnum,
  MultiselectQuestionsApplicationSectionEnum,
  PrismaClient,
  ReviewOrderTypeEnum,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request as ExpressRequest } from 'express';
import { mockDeep } from 'jest-mock-extended';
import { User } from '../../../src/dtos/users/user.dto';
import { AmiChartService } from '../../../src/services/ami-chart.service';
import { EmailService } from '../../../src/services/email.service';
import { FeatureFlagService } from '../../../src/services/feature-flag.service';
import { JurisdictionService } from '../../../src/services/jurisdiction.service';
import { PrismaService } from '../../../src/services/prisma.service';
import { ScriptRunnerService } from '../../../src/services/script-runner.service';

const externalPrismaClient = mockDeep<PrismaClient>();

describe('Testing script runner service', () => {
  let service: ScriptRunnerService;
  let prisma: PrismaService;
  let emailService: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptRunnerService,
        PrismaService,
        {
          provide: EmailService,
          useValue: {
            applicationScriptRunner: jest.fn(),
          },
        },
        AmiChartService,
        FeatureFlagService,
        JurisdictionService,
      ],
    }).compile();

    service = module.get<ScriptRunnerService>(ScriptRunnerService);
    emailService = module.get<EmailService>(EmailService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should transfer data', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'data transfer';

    const res = await service.dataTransfer(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        connectionString: process.env.TEST_CONNECTION_STRING,
      },
      externalPrismaClient,
    );

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });

  it('should add lottery translations', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValue({ id: randomUUID(), translations: {} });
    prisma.translations.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'add lottery translations';

    const res = await service.addLotteryTranslations({
      user: {
        id,
      } as unknown as User,
    } as unknown as ExpressRequest);

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });

  it('should add lottery translations and create if empty', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.translations.findMany = jest.fn().mockResolvedValue(undefined);
    prisma.translations.update = jest.fn().mockResolvedValue(null);
    prisma.translations.create = jest.fn().mockReturnValue({
      language: LanguagesEnum.en,
      translations: {},
      jurisdictions: undefined,
    });

    const id = randomUUID();
    const scriptName = 'add lottery translations create if empty';

    const res = await service.addLotteryTranslationsCreateIfEmpty({
      user: {
        id,
      } as unknown as User,
    } as unknown as ExpressRequest);

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });

    expect(prisma.translations.create).toHaveBeenCalled();
  });

  it('should bulk resend application confirmations', async () => {
    const id = randomUUID();
    const scriptName = 'bulk application resend';
    const listingId = randomUUID();
    const jurisdictionId = randomUUID();
    const applicationId = randomUUID();

    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.listings.findUnique = jest.fn().mockResolvedValue({
      id: listingId,
      jurisdictions: {
        id: jurisdictionId,
      },
    });
    prisma.applications.findMany = jest.fn().mockResolvedValue([
      {
        id: applicationId,
        language: 'en',
        confirmationCode: 'conf code',
        applicant: {
          id: randomUUID(),
          emailAddress: 'example email address',
          firstName: 'example first name',
          middleName: 'example middle name',
          lastName: 'example last name',
        },
      },
    ]);

    const res = await service.bulkApplicationResend(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        listingId,
      },
    );

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.listings.findUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        jurisdictions: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: listingId,
      },
    });
    expect(prisma.applications.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        language: true,
        confirmationCode: true,
        applicant: {
          select: {
            id: true,
            emailAddress: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
      where: {
        listingId: listingId,
        deletedAt: null,
        applicant: {
          emailAddress: {
            not: null,
          },
        },
      },
    });
    expect(emailService.applicationScriptRunner).toHaveBeenCalledWith(
      {
        id: applicationId,
        language: 'en',
        confirmationCode: 'conf code',
        applicant: {
          id: expect.anything(),
          emailAddress: 'example email address',
          firstName: 'example first name',
          middleName: 'example middle name',
          lastName: 'example last name',
        },
      },
      { id: jurisdictionId },
    );
  });

  it('should build ami chart import object', async () => {
    const id = randomUUID();
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.amiChart.create = jest.fn().mockResolvedValue(null);

    const name = 'example name';
    const scriptName = `AMI Chart ${name}`;
    const jurisdictionId = 'example jurisdictionId';
    const valueItem =
      '15 18400 21000 23650 26250 28350 30450 32550 34650\n30 39150 44750 50350 55900 60400 64850 69350 73800\n50 65250 74600 83900 93200 100700 108150 115600 123050';
    const res = await service.amiChartImport(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        values: valueItem,
        name,
        jurisdictionId,
      },
    );
    expect(res.success).toEqual(true);
    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.amiChart.create).toHaveBeenCalledWith({
      data: {
        name,
        items: [
          {
            percentOfAmi: 15,
            householdSize: 1,
            income: 18400,
          },
          {
            percentOfAmi: 15,
            householdSize: 2,
            income: 21000,
          },
          {
            percentOfAmi: 15,
            householdSize: 3,
            income: 23650,
          },
          {
            percentOfAmi: 15,
            householdSize: 4,
            income: 26250,
          },
          {
            percentOfAmi: 15,
            householdSize: 5,
            income: 28350,
          },
          {
            percentOfAmi: 15,
            householdSize: 6,
            income: 30450,
          },
          {
            percentOfAmi: 15,
            householdSize: 7,
            income: 32550,
          },
          {
            percentOfAmi: 15,
            householdSize: 8,
            income: 34650,
          },
          {
            percentOfAmi: 30,
            householdSize: 1,
            income: 39150,
          },
          {
            percentOfAmi: 30,
            householdSize: 2,
            income: 44750,
          },
          {
            percentOfAmi: 30,
            householdSize: 3,
            income: 50350,
          },
          {
            percentOfAmi: 30,
            householdSize: 4,
            income: 55900,
          },
          {
            percentOfAmi: 30,
            householdSize: 5,
            income: 60400,
          },
          {
            percentOfAmi: 30,
            householdSize: 6,
            income: 64850,
          },
          {
            percentOfAmi: 30,
            householdSize: 7,
            income: 69350,
          },
          {
            percentOfAmi: 30,
            householdSize: 8,
            income: 73800,
          },
          {
            percentOfAmi: 50,
            householdSize: 1,
            income: 65250,
          },
          {
            percentOfAmi: 50,
            householdSize: 2,
            income: 74600,
          },
          {
            percentOfAmi: 50,
            householdSize: 3,
            income: 83900,
          },
          {
            percentOfAmi: 50,
            householdSize: 4,
            income: 93200,
          },
          {
            percentOfAmi: 50,
            householdSize: 5,
            income: 100700,
          },
          {
            percentOfAmi: 50,
            householdSize: 6,
            income: 108150,
          },
          {
            percentOfAmi: 50,
            householdSize: 7,
            income: 115600,
          },
          {
            percentOfAmi: 50,
            householdSize: 8,
            income: 123050,
          },
        ],
        jurisdictions: {
          connect: {
            id: jurisdictionId,
          },
        },
      },
      include: {
        jurisdictions: true,
      },
    });
  });

  it('should update existing ami chart', async () => {
    const id = randomUUID();
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.amiChart.findUnique = jest.fn().mockResolvedValue({
      id: id,
      name: 'example name',
    });
    prisma.amiChart.update = jest.fn().mockResolvedValue(null);

    const name = 'example name';
    const scriptName = `AMI Chart ${id} update ${new Date()}`;
    const valueItem =
      '15 18400 21000 23650 26250 28350 30450 32550 34650\n30 39150 44750 50350 55900 60400 64850 69350 73800\n50 65250 74600 83900 93200 100700 108150 115600 123050';
    const res = await service.amiChartUpdateImport(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        amiId: id,
        values: valueItem,
      },
    );
    expect(res.success).toEqual(true);
    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.amiChart.update).toHaveBeenCalledWith({
      data: {
        id: undefined,
        items: [
          {
            percentOfAmi: 15,
            householdSize: 1,
            income: 18400,
          },
          {
            percentOfAmi: 15,
            householdSize: 2,
            income: 21000,
          },
          {
            percentOfAmi: 15,
            householdSize: 3,
            income: 23650,
          },
          {
            percentOfAmi: 15,
            householdSize: 4,
            income: 26250,
          },
          {
            percentOfAmi: 15,
            householdSize: 5,
            income: 28350,
          },
          {
            percentOfAmi: 15,
            householdSize: 6,
            income: 30450,
          },
          {
            percentOfAmi: 15,
            householdSize: 7,
            income: 32550,
          },
          {
            percentOfAmi: 15,
            householdSize: 8,
            income: 34650,
          },
          {
            percentOfAmi: 30,
            householdSize: 1,
            income: 39150,
          },
          {
            percentOfAmi: 30,
            householdSize: 2,
            income: 44750,
          },
          {
            percentOfAmi: 30,
            householdSize: 3,
            income: 50350,
          },
          {
            percentOfAmi: 30,
            householdSize: 4,
            income: 55900,
          },
          {
            percentOfAmi: 30,
            householdSize: 5,
            income: 60400,
          },
          {
            percentOfAmi: 30,
            householdSize: 6,
            income: 64850,
          },
          {
            percentOfAmi: 30,
            householdSize: 7,
            income: 69350,
          },
          {
            percentOfAmi: 30,
            householdSize: 8,
            income: 73800,
          },
          {
            percentOfAmi: 50,
            householdSize: 1,
            income: 65250,
          },
          {
            percentOfAmi: 50,
            householdSize: 2,
            income: 74600,
          },
          {
            percentOfAmi: 50,
            householdSize: 3,
            income: 83900,
          },
          {
            percentOfAmi: 50,
            householdSize: 4,
            income: 93200,
          },
          {
            percentOfAmi: 50,
            householdSize: 5,
            income: 100700,
          },
          {
            percentOfAmi: 50,
            householdSize: 6,
            income: 108150,
          },
          {
            percentOfAmi: 50,
            householdSize: 7,
            income: 115600,
          },
          {
            percentOfAmi: 50,
            householdSize: 8,
            income: 123050,
          },
        ],
        jurisdictions: undefined,
        name: name,
      },
      include: {
        jurisdictions: true,
      },
      where: {
        id: id,
      },
    });
  });

  it('should transfer data', async () => {
    prisma.listings.updateMany = jest.fn().mockResolvedValue({ count: 1 });

    const id = randomUUID();
    const res = await service.optOutExistingLotteries({
      user: {
        id,
      } as unknown as User,
    } as unknown as ExpressRequest);

    expect(res.success).toBe(true);

    expect(prisma.listings.updateMany).toHaveBeenCalledWith({
      data: { lotteryOptIn: false },
      where: {
        reviewOrderType: ReviewOrderTypeEnum.lottery,
        lotteryOptIn: null,
      },
    });
  });

  it('should hide programs from listing detail page', async () => {
    const id = randomUUID();
    const scriptName = 'hideProgramsFromListings';

    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.multiselectQuestions.updateMany = jest.fn().mockResolvedValue(null);

    const res = await service.hideProgramsFromListings({
      user: {
        id,
      } as unknown as User,
    } as unknown as ExpressRequest);

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.multiselectQuestions.updateMany).toHaveBeenCalledWith({
      data: {
        hideFromListing: true,
      },
      where: {
        applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
      },
    });
  });

  it('should create 16 feature flags', async () => {
    const id = randomUUID();
    const scriptName = 'add feature flags';

    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.featureFlags.create = jest.fn().mockResolvedValue({ id: 'new id' });

    const res = await service.addFeatureFlags({
      user: {
        id,
      } as unknown as User,
    } as unknown as ExpressRequest);

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.featureFlags.create).toHaveBeenCalledTimes(17);
  });

  // | ---------- HELPER TESTS BELOW ---------- | //
  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt';

    await service.markScriptAsRunStart(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
  });

  it('should error if script run is in progress or failed', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: false,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 2';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(
      `${scriptName} has an attempted run and it failed, or is in progress. If it failed, please delete the db entry and try again`,
    );

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should error if script run already succeeded', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: true,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 3';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(`${scriptName} has already been run and succeeded`);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 4';

    await service.markScriptAsComplete(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });
});
