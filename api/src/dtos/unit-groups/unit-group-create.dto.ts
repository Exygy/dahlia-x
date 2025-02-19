import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { IdDTO } from '../shared/id.dto';
import UnitGroup from './unit-group.dto';
import { UnitGroupAmiLevelCreate } from './unit-group-ami-level-create.dto';

export class UnitGroupCreate extends OmitType(UnitGroup, [
  'id',
  'createdAt',
  'updatedAt',
  'unitAccessibilityPriorityTypes',
  'unitTypes',
  'unitGroupAmiLevels',
]) {
  @Expose()
  @Type(() => IdDTO)
  @ApiPropertyOptional({ type: IdDTO })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  unitAccessibilityPriorityTypes?: IdDTO;

  @Expose()
  @Type(() => IdDTO)
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ApiPropertyOptional({ type: [IdDTO] })
  unitTypes?: IdDTO[];

  @Expose()
  @Type(() => UnitGroupAmiLevelCreate)
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ApiPropertyOptional({ type: [UnitGroupAmiLevelCreate] })
  unitGroupAmiLevels?: UnitGroupAmiLevelCreate[];
}
