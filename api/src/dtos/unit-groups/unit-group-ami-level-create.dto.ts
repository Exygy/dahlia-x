import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { IdDTO } from '../shared/id.dto';
import { UnitGroupAmiLevel } from './unit-group-ami-level.dto';

export class UnitGroupAmiLevelCreate extends OmitType(UnitGroupAmiLevel, [
  'id',
  'createdAt',
  'updatedAt',
  'amiChart',
]) {
  @Expose()
  @Type(() => IdDTO)
  @ApiPropertyOptional({ type: IdDTO })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  amiChart?: IdDTO;
}
