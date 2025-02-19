import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from '../services/prisma.service';
import { ListingPublishedUpdate } from '../dtos/listings/listing-published-update.dto';
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';

/*
  Validates if validated value is array with at least 1 element 
  only when the jurisdiction has the feature flag enableUnitGroups enabled.
  (used for units as they should not be required when unitGroups are used)
*/
export function ValidateUnitsRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateUnitsRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: {
        async validate(value: unknown[], args: ValidationArguments) {
          const jurisdictionId = (args.object as ListingPublishedUpdate)
            .jurisdictions?.id;
          if (!jurisdictionId) return true;

          const prisma = new PrismaService();
          const jurisdiction = await prisma.jurisdictions.findFirst({
            where: { id: jurisdictionId },
            include: { featureFlags: true },
          });

          const hasUnitGroupsEnabled = jurisdiction?.featureFlags?.some(
            (flag) =>
              flag.name === FeatureFlagEnum.enableUnitGroups && flag.active,
          );

          return hasUnitGroupsEnabled || (value && value.length > 0);
        },
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} must contain at least 1 elements`,
      },
    });
  };
}
