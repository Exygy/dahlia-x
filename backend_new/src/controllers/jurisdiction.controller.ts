import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JurisdictionService } from '../services/jurisdiction.service';
import { Jurisdiction } from '../dtos/jurisdictions/jurisdiction.dto';
import { JurisdictionCreate } from '../dtos/jurisdictions/jurisdiction-create.dto';
import { JurisdictionUpdate } from '../dtos/jurisdictions/jurisdiction-update.dto';
import { defaultValidationPipeOptions } from '../utilities/default-validation-pipe-options';
import { IdDTO } from '../dtos/shared/id.dto';
import { SuccessDTO } from '../dtos/shared/success.dto';

@Controller('jurisdictions')
@ApiTags('jurisdictions')
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
@ApiExtraModels(JurisdictionCreate, JurisdictionUpdate, IdDTO)
export class JurisdictionController {
  constructor(private readonly jurisdictionService: JurisdictionService) {}

  @Get()
  @ApiOperation({ summary: 'List jurisdictions', operationId: 'list' })
  @ApiOkResponse({ type: Jurisdiction, isArray: true })
  async list(): Promise<Jurisdiction[]> {
    return await this.jurisdictionService.list();
  }

  @Get(`:jurisdictionId`)
  @ApiOperation({
    summary: 'Get jurisdiction by id',
    operationId: 'retrieve',
  })
  @ApiOkResponse({ type: Jurisdiction })
  async retrieve(
    @Param('jurisdictionId') jurisdictionId: string,
  ): Promise<Jurisdiction | null> {
    return jurisdictionId && jurisdictionId !== 'undefined'
      ? this.jurisdictionService.findOne({ jurisdictionId })
      : null;
  }

  @Get(`byName/:jurisdictionName`)
  @ApiOperation({
    summary: 'Get jurisdiction by name',
    operationId: 'retrieveByName',
  })
  @ApiOkResponse({ type: Jurisdiction })
  async retrieveByName(
    @Param('jurisdictionName') jurisdictionName: string,
  ): Promise<Jurisdiction> {
    return await this.jurisdictionService.findOne({
      jurisdictionName,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Create jurisdiction',
    operationId: 'create',
  })
  @ApiOkResponse({ type: Jurisdiction })
  async create(
    @Body() jurisdiction: JurisdictionCreate,
  ): Promise<Jurisdiction> {
    return await this.jurisdictionService.create(jurisdiction);
  }

  @Put(`:jurisdictionId`)
  @ApiOperation({
    summary: 'Update jurisdiction',
    operationId: 'update',
  })
  @ApiOkResponse({ type: Jurisdiction })
  async update(
    @Body() jurisdiction: JurisdictionUpdate,
  ): Promise<Jurisdiction> {
    return await this.jurisdictionService.update(jurisdiction);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete jurisdiction by id',
    operationId: 'delete',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async delete(@Body() dto: IdDTO): Promise<SuccessDTO> {
    return await this.jurisdictionService.delete(dto.id);
  }
}
