import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDefined, Validate, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { IdDTO } from '../shared/id.dto';
import { Listing } from './listing.dto';
import { UnitCreate } from '../units/unit-create.dto';
import { ApplicationMethodCreate } from '../application-methods/application-method-create.dto';
import { AssetCreate } from '../assets/asset-create.dto';
import { UnitsSummaryCreate } from '../units/units-summary-create.dto';
import { ListingImageCreate } from './listing-image-create.dto';
import { AddressCreate } from '../addresses/address-create.dto';
import { ListingEventCreate } from './listing-event-create.dto';
import { ListingFeatures } from './listing-feature.dto';
import { ListingUtilities } from './listing-utility.dto';
import { LotteryDateParamValidator } from '../../utilities/lottery-date-validator';
import { UnitGroupCreate } from '../unit-groups/unit-group-create.dto';

export class ListingUpdate extends OmitType(Listing, [
  // fields get their type changed
  'listingMultiselectQuestions',
  'units',
  'unitGroups',
  'applicationMethods',
  'assets',
  'unitsSummary',
  'listingImages',
  'listingsResult',
  'listingsApplicationPickUpAddress',
  'listingsApplicationMailingAddress',
  'listingsApplicationDropOffAddress',
  'listingsLeasingAgentAddress',
  'listingsBuildingAddress',
  'listingsBuildingSelectionCriteriaFile',
  'listingEvents',
  'listingFeatures',
  'listingUtilities',
  'requestedChangesUser',

  // fields removed entirely
  'createdAt',
  'updatedAt',
  'referralApplication',
  'publishedAt',
  'showWaitlist',
  'unitsSummarized',
  'closedAt',
  'afsLastRunAt',
  'urlSlug',
  'applicationConfig',
  'applicationLotteryTotals',
]) {
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => IdDTO)
  @ApiPropertyOptional({ type: IdDTO, isArray: true })
  listingMultiselectQuestions?: IdDTO[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => UnitCreate)
  @ApiPropertyOptional({ type: UnitCreate, isArray: true })
  units?: UnitCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => UnitGroupCreate)
  @ApiPropertyOptional({ type: UnitGroupCreate, isArray: true })
  unitGroups?: UnitGroupCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ApplicationMethodCreate)
  @ApiPropertyOptional({
    type: ApplicationMethodCreate,
    isArray: true,
  })
  applicationMethods?: ApplicationMethodCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => AssetCreate)
  @ApiPropertyOptional({ type: AssetCreate, isArray: true })
  assets?: AssetCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ApiProperty({ type: UnitsSummaryCreate, isArray: true })
  @Type(() => UnitsSummaryCreate)
  unitsSummary: UnitsSummaryCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingImageCreate)
  @ApiPropertyOptional({ type: ListingImageCreate, isArray: true })
  listingImages?: ListingImageCreate[];

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressCreate)
  @ApiPropertyOptional({ type: AddressCreate })
  listingsApplicationPickUpAddress?: AddressCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressCreate)
  @ApiPropertyOptional({ type: AddressCreate })
  listingsApplicationMailingAddress?: AddressCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressCreate)
  @ApiPropertyOptional({ type: AddressCreate })
  listingsApplicationDropOffAddress?: AddressCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressCreate)
  @ApiPropertyOptional({ type: AddressCreate })
  listingsLeasingAgentAddress?: AddressCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressCreate)
  @ApiPropertyOptional({ type: AddressCreate })
  listingsBuildingAddress?: AddressCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AssetCreate)
  @ApiPropertyOptional({ type: AssetCreate })
  listingsBuildingSelectionCriteriaFile?: AssetCreate;

  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AssetCreate)
  @ApiPropertyOptional({ type: AssetCreate })
  listingsResult?: AssetCreate;

  @Expose()
  @Validate(LotteryDateParamValidator, {
    groups: [ValidationsGroupsEnum.default],
  })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => ListingEventCreate)
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({ type: ListingEventCreate, isArray: true })
  listingEvents: ListingEventCreate[];

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
  @ApiPropertyOptional()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => IdDTO)
  requestedChangesUser?: IdDTO;
}
