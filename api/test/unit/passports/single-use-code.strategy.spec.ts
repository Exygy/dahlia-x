import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../../src/services/prisma.service';
import { passwordToHash } from '../../../src/utilities/password-helpers';
import { SingleUseCodeStrategy } from '../../../src/passports/single-use-code.strategy';
import { LoginViaSingleUseCode } from '../../../src/dtos/auth/login-single-use-code.dto';

describe('Testing single-use-code strategy', () => {
  let strategy: SingleUseCodeStrategy;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SingleUseCodeStrategy, PrismaService],
    }).compile();

    strategy = module.get<SingleUseCodeStrategy>(SingleUseCodeStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should fail because user does not exist', async () => {
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue(null);
    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(
      `user example@exygy.com attempted to log in, but does not exist`,
    );

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });
    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail because user is locked out', async () => {
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 10,
    });
    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`Failed login attempts exceeded.`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });
    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if no singleUseCode is stored', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      mfaCodeUpdatedAt: new Date(),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`Unauthorized Exception`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        failedLoginAttemptsCount: 0,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if no singleUseCodeUpdatedAt is stored', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      mfaCode: 'zyxwv',
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`Unauthorized Exception`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        failedLoginAttemptsCount: 0,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if no singleUseCode is sent', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      mfaCode: 'zyxwv',
      mfaCodeUpdatedAt: new Date(),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`Unauthorized Exception`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        failedLoginAttemptsCount: 0,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if singleUseCode is incorrect', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      singleUseCode: 'zyxwv',
      singleUseCodeUpdatedAt: new Date(),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv1',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`singleUseCodeUnauthorized`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        singleUseCode: 'zyxwv',
        singleUseCodeUpdatedAt: expect.anything(),
        lastLoginAt: expect.anything(),
        failedLoginAttemptsCount: 1,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if singleUseCode is expired', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      singleUseCode: 'zyxwv',
      singleUseCodeUpdatedAt: new Date(0),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(`singleUseCodeUnauthorized`);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        singleUseCode: 'zyxwv',
        singleUseCodeUpdatedAt: expect.anything(),
        lastLoginAt: expect.anything(),
        failedLoginAttemptsCount: 1,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if jurisdiction disallows single use code login', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      singleUseCode: 'zyxwv',
      singleUseCodeUpdatedAt: new Date(0),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue(null);

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(
      `Single use code login is not setup for this jurisdiction`,
    );

    expect(prisma.userAccounts.findFirst).not.toHaveBeenCalled();

    expect(prisma.userAccounts.update).not.toHaveBeenCalled();

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });

  it('should fail if jurisdiction is missing from header', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      singleUseCode: 'zyxwv',
      singleUseCodeUpdatedAt: new Date(0),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue(null);

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
    };

    await expect(
      async () => await strategy.validate(request as unknown as Request),
    ).rejects.toThrowError(
      `jurisdictionname is missing from the request headers`,
    );

    expect(prisma.userAccounts.findFirst).not.toHaveBeenCalled();

    expect(prisma.userAccounts.update).not.toHaveBeenCalled();

    expect(prisma.jurisdictions.findFirst).not.toHaveBeenCalled();
  });

  it('should succeed and leave phoneNumberVerified false', async () => {
    const id = randomUUID();
    prisma.userAccounts.findFirst = jest.fn().mockResolvedValue({
      id: id,
      lastLoginAt: new Date(),
      failedLoginAttemptsCount: 0,
      confirmedAt: new Date(),
      passwordValidForDays: 100,
      passwordUpdatedAt: new Date(),
      userRoles: { isAdmin: false },
      passwordHash: await passwordToHash('abcdef'),
      mfaEnabled: true,
      phoneNumberVerified: false,
      singleUseCode: 'zyxwv',
      singleUseCodeUpdatedAt: new Date(),
    });

    prisma.userAccounts.update = jest.fn().mockResolvedValue({ id });

    prisma.jurisdictions.findFirst = jest.fn().mockResolvedValue({
      id: randomUUID(),
    });

    const request = {
      body: {
        email: 'example@exygy.com',
        singleUseCode: 'zyxwv',
      } as LoginViaSingleUseCode,
      headers: { jurisdictionname: 'juris 1' },
    };

    await strategy.validate(request as unknown as Request);

    expect(prisma.userAccounts.findFirst).toHaveBeenCalledWith({
      include: {
        userRoles: true,
        listings: true,
        jurisdictions: true,
      },
      where: {
        email: 'example@exygy.com',
      },
    });

    expect(prisma.userAccounts.update).toHaveBeenCalledWith({
      data: {
        singleUseCode: null,
        singleUseCodeUpdatedAt: expect.anything(),
        lastLoginAt: expect.anything(),
        failedLoginAttemptsCount: 0,
      },
      where: {
        id,
      },
    });

    expect(prisma.jurisdictions.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          in: ['juris 1'],
        },
        allowSingleUseCodeLogin: true,
      },
    });
  });
});
