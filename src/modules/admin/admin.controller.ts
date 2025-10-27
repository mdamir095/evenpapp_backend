import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Put,
  HttpCode,
  Delete,
  UseGuards,
  NotFoundException,
  Query,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { LoginReqDto } from '../auth/dto/request/login.req.dto';
import { ForgotPasswordDto } from '../auth/dto/request/forgot-password.req.dto';
import { ResetPasswordDto } from '@modules/auth/dto/request/reset-password.req.dto';
import { CreateFeatureDto } from '@modules/feature/dto/request/create-feature.dto';
import { FeatureDto } from '@modules/feature/dto/response/feature.dto';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureGuard } from '@common/guards/features.guard';
import { CreateUserFeaturePermissionDto } from '@modules/user-feature-permission/dto/create-user-feature-permission.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { UpdateAdminProfileDto } from './dto/request/update-profile.dto';
import { FeatureType } from '@shared/enums/featureType';
import { UpdateUserStatusDto } from './dto/request/update-user-status.dto';
import { UpdateUserTypeDto } from './dto/request/update-user-type.dto';
import { BlockUserDto } from './dto/request/block-user.dto';


@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search keyword (email, name, etc.)',
  })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'Filter by first name',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Filter by last name',
  })
  @ApiQuery({
    name: 'organizationName',
    required: false,
    description: 'Filter by organization name',
  })
  @ApiQuery({
    name: 'roleName',
    required: false,
    description: 'Filter by role name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  async getAllUsers(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('email') email?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('organizationName') organizationName?: string,
    @Query('roleName') roleName?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const currentUser = req.user;
    return this.adminService.getAllUsers(currentUser, {
      search,
      email,
      firstName,
      lastName,
      organizationName,
      roleName,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Post('feature-permission')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Assign feature permissions to user' })
  @ApiBody({ type: CreateUserFeaturePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Feature permissions assigned to user successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createFeaturePermission(@Body() dto: CreateUserFeaturePermissionDto) {
    return this.adminService.createFeaturePermission(dto);
  }

  @Get('feature-permission/:roleId')
   @UseGuards(AuthGuard('jwt'), FeatureGuard)
   @Features(FeatureType.USER_MANAGEMENT)
  async getByUserId(@Param('roleId') roleId: string) {
    return await this.adminService.getFeaturePermission(roleId);
  }

  @Get('roles')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiOperation({
    summary: 'Get all roles with optional pagination and filtering',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by role name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  async getAllRoles(
    @Query('name') name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getAllRoles({
      name,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get('roles')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getRoleList() {
    return this.adminService.getRoleList();
  }

  @Get('roles/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role details retrieved successfully',
  })
  async getRoleById(@Param('id') id: string) {
    const role = await this.adminService.getRoleById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  @Post('roles')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.adminService.createRole(dto);
  }

  @Put('roles/:id')
  // @UseGuards(AuthGuard('jwt'))
  // @Features(FeatureType.USER)
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (MongoDB ObjectId)' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async updateRole(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    return this.adminService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  async deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(id);
  }

  @Delete('roles/:roleId/features/:featureId')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Remove a feature from a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID (MongoDB ObjectId)' })
  @ApiParam({ name: 'featureId', description: 'Feature ID (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Feature removed from role successfully' })
  async removeFeatureFromRole(
    @Param('roleId') roleId: string, 
    @Param('featureId') featureId: string
  ) {
    return this.adminService.removeFeatureFromRole(roleId, featureId);
  }

  @Post('features')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Create a new feature' })
  @ApiBody({ type: CreateFeatureDto })
  @ApiResponse({
    status: 201,
    description: 'Feature created successfully',
    type: FeatureDto,
  })
  @ApiResponse({ status: 409, description: 'Feature already exists' })
  async create(@Body() dto: CreateFeatureDto): Promise<any> {
    return this.adminService.createFeature(dto);
  }

  @Get('features')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get all features' })
    @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all features',
    type: [FeatureDto],
  })
  @ApiResponse({ status: 404, description: 'No features found' })
  @ApiResponse({ status: 500, description: 'Internal server error' }) 
  async getAllFeatures(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.findAllFeatures(Number(page), Number(limit));
  }

  @Get('features/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature details retrieved successfully',
  })
  async getFeatureById(@Param('id') id: string) {
    const feature = await this.adminService.getFeatureById(id);
    if (!feature) throw new NotFoundException('Feature not found');
    return feature;
  }

  @Put('features/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update a feature by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  updateFeature(@Param('id') id: string, @Body() dto: CreateFeatureDto) {
    return this.adminService.updateFeature(id, dto);
  }

  @Delete('features/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Feature deleted successfully' })
  deleteFeature(@Param('id') id: string): Promise<{ message: string }> {
    return this.adminService.deleteFeature(id);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginReqDto })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  async adminLogin(@Body() dto: LoginReqDto) {
    return this.adminService.adminLogin(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Admin forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset instructions sent' })
  async adminForgetPassword(@Body() dto: ForgotPasswordDto) {
    return this.adminService.adminForgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset admin password' })
  @HttpCode(200)
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.adminService.adminResetPassword(dto);
  }

  @Patch('users/:id/status')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update user active status' })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto);
  }

  @Patch('users/:id/block')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Block/Unblock user' })
  async blockUser(
    @Param('id') userId: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.adminService.blockUser(userId, dto);
  }

  @Patch('users/:id/type')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update user type' })
  async updateUserType(
    @Param('id') userId: string,
    @Body() dto: UpdateUserTypeDto,
  ) {
    return this.adminService.updateUserType(userId, dto);
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update admin profile' })
  @ApiBody({ type: UpdateAdminProfileDto })
  @ApiResponse({ status: 200, description: 'Admin profile updated' })
  async updateAdminProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateAdminProfileDto
  ) {
    return this.adminService.updateUserById(userId, dto);
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUserById(
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUserById(userId, dto);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
   @Features(FeatureType.USER_MANAGEMENT)

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUserById(@Param('id') userId: string) {
    return this.adminService.deleteUserById(userId);
  }
  @Post('user')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() dto: UpdateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Change password (Admin)' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const userId = req.user.id;
    return this.adminService.changePassword(userId, dto);
  }
}
