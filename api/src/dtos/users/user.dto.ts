import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EnforceLowerCase } from '../../decorators/enforce-lower-case.decorator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { AbstractDTO } from '../shared/abstract.dto';
import { LanguagesEnum } from '@prisma/client';
import { IdDTO } from '../shared/id.dto';
import { UserRole } from './user-role.dto';
import { Jurisdiction } from '../jurisdictions/jurisdiction.dto';

export class User extends AbstractDTO {
  @Expose()
  @Type(() => Date)
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  passwordUpdatedAt: Date;

  @Expose()
  @IsNumber({}, { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  passwordValidForDays: number;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  confirmedAt?: Date;

  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  @ApiProperty()
  email: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiPropertyOptional()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  middleName?: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiPropertyOptional()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  dob?: Date;

  @Expose()
  @ApiPropertyOptional()
  @IsPhoneNumber('US', { groups: [ValidationsGroupsEnum.default] })
  phoneNumber?: string;

  @Expose()
  @Type(() => IdDTO)
  @ApiProperty({ type: IdDTO, isArray: true, nullable: true })
  listings?: IdDTO[];

  @Expose()
  @Type(() => UserRole)
  @ApiPropertyOptional({ type: UserRole })
  userRoles?: UserRole;

  @Expose()
  @IsEnum(LanguagesEnum, { groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional({
    enum: LanguagesEnum,
    enumName: 'LanguagesEnum',
  })
  language?: LanguagesEnum;

  @Expose()
  @Type(() => Jurisdiction)
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ArrayMinSize(1, { groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ApiProperty({ type: Jurisdiction, isArray: true })
  jurisdictions: Jurisdiction[];

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  mfaEnabled?: boolean;

  @Expose()
  @Type(() => Date)
  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @Expose()
  @Type(() => Number)
  @ApiPropertyOptional()
  failedLoginAttemptsCount?: number;

  @Expose()
  @ApiPropertyOptional()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  phoneNumberVerified?: boolean;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  agreedToTermsOfService: boolean;

  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  @ApiPropertyOptional()
  hitConfirmationURL?: Date;

  // storing the active access token for a user
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  activeAccessToken?: string;

  // storing the active refresh token for a user
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiPropertyOptional()
  activeRefreshToken?: string;

  @Expose()
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => IdDTO)
  @ApiPropertyOptional({ type: IdDTO, isArray: true })
  favoriteListings?: IdDTO[];
}
