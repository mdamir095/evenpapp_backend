import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { CreateEnterpriseDto } from './dto/request/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/request/update-enterprise.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Features, Roles } from '@common/decorators/permission.decorator';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { ResendResetLinkDto } from './dto/request/resend-reset-link.dto';
import { FeatureGuard } from '@common/guards/features.guard';
import { FeatureType } from '@shared/enums/featureType';
import { AddEnterpriseUserDto } from './dto/request/add-enterprise-user.dto';
import { UpdateEnterpriseUserDto } from './dto/request/update-enterprise-user.dto';
import { UpdateEnterpriseUserStatusDto } from './dto/request/update-enterprise-user-status.dto';

@ApiTags('Enterprises')
@Controller('admin/enterprises')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Patch('reset-password/:token')
  @ApiOperation({ summary: 'Reset password' })
  @ApiParam({ name: 'token', type: String, required: true, description: 'Token' })
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.enterpriseService.resetPassword(token, dto);  
  }

  @Post()
  @ApiOperation({ summary: 'Create a new enterprise' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  create(@Body() dto: CreateEnterpriseDto) {
    return this.enterpriseService.create(dto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get enterprise list for dropdown (id and name only)' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  getEnterpriseList(@Query('search') search?: string) {
    return this.enterpriseService.getEnterpriseList(search);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enterprises' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  findAll(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
    @Query('search') search: string = ''
  ) {
    return this.enterpriseService.findAll(page, limit, search);
  }

  @Post('users')
  @ApiOperation({ summary: 'Add a new user to enterprise (Enterprise Admin only)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  addUser(@Req() req: any, @Body() dto: AddEnterpriseUserDto) {
    return this.enterpriseService.addEnterpriseUser(req.user, dto);
  }

  @Post('users/resend-reset-link')
  @ApiOperation({ summary: 'Resend reset password link to an enterprise user by email' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  resendResetLink(@Req() req: any, @Body() dto: ResendResetLinkDto) {
    return this.enterpriseService.resendResetLink(req.user, dto);
  }

  @Get('features')
  @ApiOperation({ summary: 'Get accessible features for enterprise admin' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  @ApiQuery({ name: 'enterpriseId', required: false, type: String, description: 'Enterprise ID' })
  getAccessibleFeatures(@Req() req: any, @Query('enterpriseId') enterpriseId?: string) {
    return this.enterpriseService.getAccessibleFeatures(req.user, enterpriseId);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update enterprise user active status. If admin is deactivated, cascade to all enterprise users.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  updateEnterpriseUserStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEnterpriseUserStatusDto,
  ) {
    return this.enterpriseService.updateEnterpriseUserStatus(req.user, id, dto);
  }
  
  @Get('users')
  @ApiOperation({ summary: 'Get enterprise users (paginated)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'enterpriseId', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getEnterpriseUsers(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('enterpriseId') enterpriseId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.enterpriseService.getEnterpriseUsers(req.user, {
      search,
      enterpriseId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get enterprise user by id (with roles and features)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  getEnterpriseUser(@Param('id') id: string) {
    return this.enterpriseService.getEnterpriseUser( id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update enterprise user and their features' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT, FeatureType.EMPLOYEE_MANAGEMENT)
  updateEnterpriseUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEnterpriseUserDto,
  ) {
    return this.enterpriseService.updateEnterpriseUser(req.user, id, dto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get an enterprise by key' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  findOne(@Param('key') key: string) {
    return this.enterpriseService.findOneByKey(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update an enterprise by key' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  update(@Param('key') key: string, @Body() dto: UpdateEnterpriseDto) {
    return this.enterpriseService.update(key, dto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete an enterprise by key' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ENTERPRISE_MANAGEMENT)
  remove(@Param('key') key: string) {
    return this.enterpriseService.delete(key);
  }
}

