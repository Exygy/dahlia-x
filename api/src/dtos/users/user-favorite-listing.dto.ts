import { Expose } from 'class-transformer';
import { IsDefined, IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModificationEnum } from '../../enums/shared/modification-enum';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';

export class UserFavoriteListing {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsUUID(4, { groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ enum: ModificationEnum, enumName: 'ModificationEnum' })
  @IsEnum(ModificationEnum, {
    groups: [ValidationsGroupsEnum.default],
  })
  action: ModificationEnum;
}
