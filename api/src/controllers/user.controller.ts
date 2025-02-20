import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { User } from '../dtos/users/user.dto';
import { defaultValidationPipeOptions } from '../utilities/default-validation-pipe-options';
import { IdDTO } from '../dtos/shared/id.dto';
import { mapTo } from '../utilities/mapTo';
import { PaginatedUserDto } from '../dtos/users/paginated-user.dto';
import { UserQueryParams } from '../dtos/users/user-query-param.dto';
import { Request as ExpressRequest, Response } from 'express';
import { UserUpdate } from '../dtos/users/user-update.dto';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { UserCreate } from '../dtos/users/user-create.dto';
import { UserCreateParams } from '../dtos/users/user-create-params.dto';
import { UserFavoriteListing } from '../dtos/users/user-favorite-listing.dto';
import { EmailAndAppUrl } from '../dtos/users/email-and-app-url.dto';
import { ConfirmationRequest } from '../dtos/users/confirmation-request.dto';
import { UserInvite } from '../dtos/users/user-invite.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { UserProfilePermissionGuard } from '../guards/user-profile-permission-guard';
import { OptionalAuthGuard } from '../guards/optional.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { AdminOrJurisdictionalAdminGuard } from '../guards/admin-or-jurisdiction-admin.guard';
import { ActivityLogInterceptor } from '../interceptors/activity-log.interceptor';
import { PermissionTypeDecorator } from '../decorators/permission-type.decorator';
import { UserFilterParams } from '../dtos/users/user-filter-params.dto';
import { UserCsvExporterService } from '../services/user-csv-export.service';
import { ExportLogInterceptor } from '../interceptors/export-log.interceptor';
import { RequestSingleUseCode } from '../dtos/single-use-code/request-single-use-code.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Controller('user')
@ApiTags('user')
@PermissionTypeDecorator('user')
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
@ApiExtraModels(IdDTO, EmailAndAppUrl)
@UseGuards(ApiKeyGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userCSVExportService: UserCsvExporterService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, UserProfilePermissionGuard)
  @ApiOkResponse({ type: User })
  @ApiOperation({
    summary: 'Get a user from cookies',
    operationId: 'profile',
  })
  profile(@Request() req: ExpressRequest): User {
    return mapTo(User, req['user']);
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(defaultValidationPipeOptions))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({ type: PaginatedUserDto })
  @ApiOperation({
    summary: 'Get a paginated set of users',
    operationId: 'list',
  })
  @UseGuards(OptionalAuthGuard, AdminOrJurisdictionalAdminGuard)
  @ApiExtraModels(UserFilterParams)
  async list(
    @Request() req: ExpressRequest,
    @Query() queryParams: UserQueryParams,
  ): Promise<PaginatedUserDto> {
    return await this.userService.list(queryParams, mapTo(User, req['user']));
  }

  @Get('/csv')
  @UsePipes(new ValidationPipe(defaultValidationPipeOptions))
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'List users in CSV',
    operationId: 'listAsCsv',
  })
  @Header('Content-Type', 'text/csv')
  @UseGuards(OptionalAuthGuard, AdminOrJurisdictionalAdminGuard)
  @UseInterceptors(ExportLogInterceptor)
  async listAsCsv(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return await this.userCSVExportService.exportFile(req, res);
  }

  @Put('forgot-password')
  @ApiOperation({ summary: 'Forgot Password', operationId: 'forgotPassword' })
  @ApiOkResponse({ type: SuccessDTO })
  async forgotPassword(@Body() dto: EmailAndAppUrl): Promise<SuccessDTO> {
    return await this.userService.forgotPassword(dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user by id', operationId: 'delete' })
  @ApiOkResponse({ type: SuccessDTO })
  @UseGuards(OptionalAuthGuard, PermissionGuard)
  @UseInterceptors(ActivityLogInterceptor)
  async delete(
    @Body() dto: IdDTO,
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.userService.delete(dto.id, mapTo(User, req['user']));
  }

  @Post()
  @ApiOperation({
    summary: 'Creates a public only user',
    operationId: 'create',
  })
  @ApiOkResponse({ type: User })
  @UseGuards(OptionalAuthGuard, PermissionGuard)
  async create(
    @Request() req: ExpressRequest,
    @Body() dto: UserCreate,
    @Query() queryParams: UserCreateParams,
  ): Promise<User> {
    return await this.userService.create(
      dto,
      false,
      queryParams.noWelcomeEmail !== true,
      req,
    );
  }

  @Post('/invite')
  @ApiOperation({ summary: 'Invite partner user', operationId: 'invite' })
  @ApiOkResponse({ type: User })
  @UseGuards(OptionalAuthGuard)
  @UseInterceptors(ActivityLogInterceptor)
  async invite(
    @Body() dto: UserInvite,
    @Request() req: ExpressRequest,
  ): Promise<User> {
    return await this.userService.create(dto, true, undefined, req);
  }

  @Post('request-single-use-code')
  @ApiOperation({
    summary: 'Request single use code',
    operationId: 'requestSingleUseCode',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async requestSingleUseCode(
    @Request() req: ExpressRequest,
    @Body() dto: RequestSingleUseCode,
  ): Promise<SuccessDTO> {
    return await this.userService.requestSingleUseCode(dto, req);
  }

  @Post('resend-confirmation')
  @ApiOperation({
    summary: 'Resend public confirmation',
    operationId: 'resendConfirmation',
  })
  @ApiOkResponse({ type: SuccessDTO })
  @UseGuards(OptionalAuthGuard, PermissionGuard)
  async confirmation(@Body() dto: EmailAndAppUrl): Promise<SuccessDTO> {
    return await this.userService.resendConfirmation(dto, true);
  }

  @Post('resend-partner-confirmation')
  @ApiOperation({
    summary: 'Resend partner confirmation',
    operationId: 'resendPartnerConfirmation',
  })
  @ApiOkResponse({ type: SuccessDTO })
  @UseGuards(OptionalAuthGuard, PermissionGuard)
  async requestConfirmationResend(
    @Body() dto: EmailAndAppUrl,
  ): Promise<SuccessDTO> {
    return await this.userService.resendConfirmation(dto, false);
  }

  @Post('is-confirmation-token-valid')
  @ApiOperation({
    summary: 'Verifies token is valid',
    operationId: 'isUserConfirmationTokenValid',
  })
  @ApiOkResponse({ type: SuccessDTO })
  @UseGuards(OptionalAuthGuard, PermissionGuard)
  async isUserConfirmationTokenValid(
    @Body() dto: ConfirmationRequest,
  ): Promise<SuccessDTO> {
    return await this.userService.isUserConfirmationTokenValid(dto);
  }

  @Put(`modifyFavoriteListings`)
  @ApiOperation({
    summary: 'Add or remove a listing from user favorites',
    operationId: 'modifyFavoriteListings',
  })
  @ApiOkResponse({ type: UserFavoriteListing })
  @UseGuards(JwtAuthGuard, UserProfilePermissionGuard)
  async modifyFavoriteListings(
    @Request() req: ExpressRequest,
    @Body() dto: UserFavoriteListing,
  ): Promise<User> {
    return await this.userService.modifyFavoriteListings(
      dto,
      mapTo(User, req['user']),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', operationId: 'update' })
  @ApiOkResponse({ type: User })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UseInterceptors(ActivityLogInterceptor)
  async update(
    @Request() req: ExpressRequest,
    @Body() dto: UserUpdate,
  ): Promise<User> {
    const jurisdictionName = req.headers['jurisdictionname'] || '';
    return await this.userService.update(
      dto,
      mapTo(User, req['user']),
      jurisdictionName as string,
    );
  }

  @Get(`:id`)
  @ApiOperation({
    summary: 'Get user by id',
    operationId: 'retrieve',
  })
  @ApiOkResponse({ type: User })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async retrieve(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Promise<User> {
    return this.userService.findOne(userId);
  }
}
