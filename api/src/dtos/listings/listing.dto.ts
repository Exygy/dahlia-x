import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { AbstractDTO } from '../shared/abstract.dto';
import {
  ApplicationAddressTypeEnum,
  ApplicationMethodsTypeEnum,
  HomeTypeEnum,
  ListingsStatusEnum,
  LotteryStatusEnum,
  ReviewOrderTypeEnum,
} from '@prisma/client';
import { EnforceLowerCase } from '../../decorators/enforce-lower-case.decorator';
import { ListingMultiselectQuestion } from './listing-multiselect-question.dto';
import { ApplicationMethod } from '../application-methods/application-method.dto';
import { Asset } from '../assets/asset.dto';
import { ListingEvent } from './listing-event.dto';
import { Address } from '../addresses/address.dto';
import { ListingImage } from './listing-image.dto';
import { ListingFeatures } from './listing-feature.dto';
import { ListingUtilities } from './listing-utility.dto';
import { Unit } from '../units/unit.dto';
import { UnitGroup } from '../unit-groups/unit-group.dto';
import { UnitsSummarized } from '../units/unit-summarized.dto';
import { UnitsSummary } from '../units/units-summary.dto';
import { IdDTO } from '../shared/id.dto';
import { listingUrlSlug } from '../../utilities/listing-url-slug';
import { User } from '../users/user.dto';
import { requestedChangesUserMapper } from '../../utilities/requested-changes-user';
import { LotteryDateParamValidator } from '../../utilities/lottery-date-validator';
import { ApplicationLotteryTotal } from '../applications/application-lottery-total.dto';

class Listing extends AbstractDTO {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  additionalApplicationSubmissionNotes?: string;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  digitalApplication?: boolean;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  commonDigitalApplication?: boolean;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  paperApplication?: boolean;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  referralOpportunity?: boolean;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  accessibility?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  amenities?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  buildingTotalUnits?: number;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  developer?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  householdSizeMax?: number;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  householdSizeMin?: number;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  neighborhood?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  petPolicy?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  smokingPolicy?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  unitsAvailable?: number;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  unitAmenities?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  servicesOffered?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  yearBuilt?: number;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  applicationDueDate?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  applicationOpenDate?: Date;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  applicationFee?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  applicationOrganization?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  applicationPickUpAddressOfficeHours?: string;

  @Expose()
  @IsEnum(ApplicationAddressTypeEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ApiPropertyOptional({
    enum: ApplicationAddressTypeEnum,
    enumName: 'ApplicationAddressTypeEnum',
  })
  applicationPickUpAddressType?: ApplicationAddressTypeEnum;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  applicationDropOffAddressOfficeHours?: string;

  @Expose()
  @IsEnum(ApplicationAddressTypeEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ApiPropertyOptional({
    enum: ApplicationAddressTypeEnum,
    enumName: 'ApplicationAddressTypeEnum',
  })
  applicationDropOffAddressType?: ApplicationAddressTypeEnum;

  @Expose()
  @IsEnum(ApplicationAddressTypeEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ApiPropertyOptional({
    enum: ApplicationAddressTypeEnum,
    enumName: 'ApplicationAddressTypeEnum',
  })
  applicationMailingAddressType?: ApplicationAddressTypeEnum;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  @IsUrl(
    { require_protocol: true },
    { groups: [ValidationsGroupsEnum.default] },
  )
  buildingSelectionCriteria?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  costsNotIncluded?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  creditHistory?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  criminalBackground?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  depositMin?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  depositMax?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  depositHelperText?: string;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  disableUnitsAccordion?: boolean;

  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  @ApiPropertyOptional()
  leasingAgentEmail?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  leasingAgentName?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  leasingAgentOfficeHours?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  leasingAgentPhone?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  leasingAgentTitle?: string;

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  name: string;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  postmarkedApplicationsReceivedByDate?: Date;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  programRules?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  rentalAssistance?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  rentalHistory?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  requiredDocuments?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  specialNotes?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  waitlistCurrentSize?: number;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  waitlistMaxSize?: number;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  whatToExpect?: string;

  @Expose()
  @IsEnum(ListingsStatusEnum, { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({
    enum: ListingsStatusEnum,
    enumName: 'ListingsStatusEnum',
  })
  status: ListingsStatusEnum;

  @Expose()
  @IsEnum(ReviewOrderTypeEnum, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional({
    enum: ReviewOrderTypeEnum,
    enumName: 'ReviewOrderTypeEnum',
  })
  reviewOrderType?: ReviewOrderTypeEnum;

  @Expose()
  @ApiPropertyOptional()
  applicationConfig?: Record<string, unknown>;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  displayWaitlistSize: boolean;

  @Expose()
  @ApiPropertyOptional()
  get showWaitlist(): boolean {
    return (
      this.waitlistMaxSize !== null &&
      this.waitlistCurrentSize !== null &&
      this.waitlistCurrentSize < this.waitlistMaxSize
    );
  }

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(4096, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  reservedCommunityDescription?: string;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  reservedCommunityMinAge?: number;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(4096, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  resultLink?: string;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  isWaitlistOpen?: boolean;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  waitlistOpenSpots?: number;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  customMapPin?: boolean;

  //Used to refresh translations and communicate recent changes to admin users
  //should be revisited after translations refactoring to see if its still useful
  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  contentUpdatedAt?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  publishedAt?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  closedAt?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  afsLastRunAt?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  lotteryLastPublishedAt?: Date;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  lotteryLastRunAt?: Date;

  @Expose()
  @IsEnum(LotteryStatusEnum, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional({
    enum: LotteryStatusEnum,
    enumName: 'LotteryStatusEnum',
  })
  lotteryStatus?: LotteryStatusEnum;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  lastApplicationUpdateAt?: Date;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingMultiselectQuestion)
  @ApiPropertyOptional({
    type: ListingMultiselectQuestion,
    isArray: true,
  })
  listingMultiselectQuestions?: ListingMultiselectQuestion[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => ApplicationMethod)
  @ApiProperty({ type: ApplicationMethod, isArray: true })
  applicationMethods: ApplicationMethod[];

  @Expose()
  @ApiPropertyOptional()
  get referralApplication(): ApplicationMethod | undefined {
    return this.applicationMethods?.find(
      (method) => method.type === ApplicationMethodsTypeEnum.Referral,
    );
  }

  // This is no longer needed and should be removed https://github.com/bloom-housing/bloom/issues/3747
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => Asset)
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({ type: Asset, isArray: true })
  assets: Asset[];

  @Expose()
  @Validate(LotteryDateParamValidator, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingEvent)
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({ type: ListingEvent, isArray: true })
  listingEvents: ListingEvent[];

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  @ApiProperty({ type: Address })
  listingsBuildingAddress: Address;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  @ApiPropertyOptional({ type: Address })
  listingsApplicationPickUpAddress?: Address;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  @ApiPropertyOptional({ type: Address })
  listingsApplicationDropOffAddress?: Address;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  @ApiPropertyOptional({ type: Address })
  listingsApplicationMailingAddress?: Address;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Address)
  @ApiPropertyOptional({ type: Address })
  listingsLeasingAgentAddress?: Address;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Asset)
  @ApiPropertyOptional({ type: Asset })
  listingsBuildingSelectionCriteriaFile?: Asset;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => IdDTO)
  @ApiProperty({ type: IdDTO })
  jurisdictions: IdDTO;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Asset)
  @ApiPropertyOptional({ type: Asset })
  listingsResult?: Asset;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => IdDTO)
  @ApiPropertyOptional({ type: IdDTO })
  reservedCommunityTypes?: IdDTO;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingImage)
  @ApiPropertyOptional({ type: ListingImage, isArray: true })
  listingImages?: ListingImage[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingFeatures)
  @ApiPropertyOptional({ type: ListingFeatures })
  listingFeatures?: ListingFeatures;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingUtilities)
  @ApiPropertyOptional({ type: ListingUtilities })
  listingUtilities?: ListingUtilities;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => Unit)
  @ApiProperty({ type: Unit, isArray: true })
  units: Unit[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => UnitGroup)
  @ApiPropertyOptional({ type: UnitGroup, isArray: true })
  unitGroups?: UnitGroup[];

  @Expose()
  @ApiPropertyOptional({ type: UnitsSummarized })
  unitsSummarized?: UnitsSummarized;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ApiPropertyOptional({ type: UnitsSummary, isArray: true })
  @Type(() => UnitsSummary)
  unitsSummary?: UnitsSummary[];

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  @Transform((value: TransformFnParams) => listingUrlSlug(value.obj as Listing))
  urlSlug?: string;

  @Expose()
  @ApiPropertyOptional()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  requestedChanges?: string;

  @Expose()
  @ApiPropertyOptional()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  requestedChangesDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @Transform(
    (obj: any) => {
      return obj.obj.requestedChangesUser
        ? requestedChangesUserMapper(obj.obj.requestedChangesUser as User)
        : undefined;
    },
    {
      toClassOnly: true,
    },
  )
  requestedChangesUser?: IdDTO;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  lotteryOptIn?: boolean;

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ApplicationLotteryTotal)
  @ApiProperty({ type: ApplicationLotteryTotal, isArray: true })
  applicationLotteryTotals: ApplicationLotteryTotal[];

  @Expose()
  @ApiPropertyOptional()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  includeCommunityDisclaimer?: boolean;

  @Expose()
  @ApiPropertyOptional()
  @ValidateIf((o) => o.includeCommunityDisclaimer, {
    groups: [ValidationsGroupsEnum.default],
  })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  communityDisclaimerTitle?: string;

  @Expose()
  @ApiPropertyOptional()
  @ValidateIf((o) => o.includeCommunityDisclaimer, {
    groups: [ValidationsGroupsEnum.default],
  })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  communityDisclaimerDescription?: string;

  @Expose()
  @IsEnum(HomeTypeEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ApiPropertyOptional({
    enum: HomeTypeEnum,
    enumName: 'HomeTypeEnum',
  })
  homeType?: HomeTypeEnum;
}

export { Listing as default, Listing };
