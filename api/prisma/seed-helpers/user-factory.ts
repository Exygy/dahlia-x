import { Prisma } from '@prisma/client';
import { randomAdjective, randomNoun } from './word-generator';
import { passwordToHash } from '../../src/utilities/password-helpers';

export const userFactory = async (optionalParams?: {
  acceptedTerms?: boolean;
  confirmedAt?: Date;
  email?: string;
  favoriteListings?: string[];
  firstName?: string;
  jurisdictionIds?: string[];
  lastName?: string;
  listings?: string[];
  mfaEnabled?: boolean;
  middleName?: string;
  password?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  roles?: Prisma.UserRolesUncheckedCreateWithoutUserAccountsInput;
  singleUseCode?: string;
}): Promise<Prisma.UserAccountsCreateInput> => ({
  agreedToTermsOfService: optionalParams?.acceptedTerms || false,
  confirmedAt: optionalParams?.confirmedAt || null,
  email:
    optionalParams?.email?.toLocaleLowerCase() ||
    `${randomNoun().toLowerCase()}${randomNoun().toLowerCase()}@${randomAdjective().toLowerCase()}.com`,
  firstName: optionalParams?.firstName || 'First',
  lastName: optionalParams?.lastName || 'Last',
  middleName: optionalParams?.middleName || 'Middle',
  mfaEnabled: optionalParams?.mfaEnabled || false,
  passwordHash: optionalParams?.password
    ? await passwordToHash(optionalParams?.password)
    : await passwordToHash('Abcdef12345!'),
  phoneNumber: optionalParams?.phoneNumber || null,
  phoneNumberVerified: optionalParams?.phoneNumberVerified || null,
  singleUseCode: optionalParams?.singleUseCode || null,
  singleUseCodeUpdatedAt: optionalParams?.mfaEnabled ? new Date() : undefined,

  favoriteListings: optionalParams?.favoriteListings
    ? {
        connect: optionalParams.favoriteListings.map((listing) => {
          return { id: listing };
        }),
      }
    : undefined,
  jurisdictions: optionalParams?.jurisdictionIds
    ? {
        connect: optionalParams?.jurisdictionIds.map((jurisdiction) => {
          return {
            id: jurisdiction,
          };
        }),
      }
    : undefined,
  listings: optionalParams?.listings
    ? {
        connect: optionalParams.listings.map((listing) => {
          return { id: listing };
        }),
      }
    : undefined,
  userRoles: {
    create: {
      isAdmin: optionalParams?.roles?.isAdmin || false,
      isJurisdictionalAdmin:
        optionalParams?.roles?.isJurisdictionalAdmin || false,
      isPartner: optionalParams?.roles?.isPartner || false,
    },
  },
});
