import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginReqDto } from '../auth/dto/request/login.req.dto';
import { ForgotPasswordDto } from '../auth/dto/request/forgot-password.req.dto';
import * as bcrypt from 'bcrypt';
import { CreateFeatureDto } from '@modules/feature/dto/request/create-feature.dto';
import { FeatureService } from '@modules/feature/feature.service';
import { RoleService } from '@modules/role/role.service';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { UserService } from '@modules/user/user.service';
import { ResetPasswordDto } from '@modules/auth/dto/request/reset-password.req.dto';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { UserFeaturePermissionService } from '@modules/user-feature-permission/user-feature-permission.service';
import { CreateUserFeaturePermissionDto } from '@modules/user-feature-permission/dto/create-user-feature-permission.dto';
import { UpdateRoleDto } from '@modules/role/dto/request/update-role.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { RoleType } from '@shared/enums/roleType';
import { UpdateUserTypeDto } from './dto/request/update-user-type.dto';
import { BlockUserDto } from './dto/request/block-user.dto';
import { UpdateUserStatusDto } from './dto/request/update-user-status.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly featureService: FeatureService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly featurePermissionService: UserFeaturePermissionService
  ) {}

  async getAllUsers(currentUser: any, {
    search,
    email,
    firstName,
    lastName,
    organizationName,
    roleName,
    page = 1,
    limit = 10,
  }: {
    search?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    roleName?: string,
    page?: number;
    limit?: number;
  }) {
    return this.userService.findAll(currentUser, {
    search,
    email,
    firstName,
    lastName,
    organizationName,
    roleName,
    page,
    limit,
  });
  }

  async getAllUsersByType(currentUser: any, {
    search,
    email,
    firstName,
    lastName,
    organizationName,
    roleName,
    page = 1,
    limit = 10,
  }: {
    search?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    roleName?: string,
    page?: number;
    limit?: number;
  }) {
    return this.userService.findAllUsersByType(currentUser, {
      search,
      email,
      firstName,
      lastName,
      organizationName,
      roleName,
      page,
      limit,
    });
  }

  async getAllRoles(filters: {
  name?: string;
  page: number;
  limit: number;
  }) {
      return this.roleService.findAll(filters);
    }

  async getRoleList() {
    return this.roleService.getRoleList();
  }

  async createRole(dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  async getRoleById(id:string){
    return this.roleService.findOne(id);
  }

  async deleteRole(id:string){
    return this.roleService.deleteRole(id);
  }

  async findAllFeatures(page: number, limit: number) {
    return this.featureService.findAll(page, limit);
  }

  async createFeature(dto: CreateFeatureDto) {
    return this.featureService.create(dto);
  }

   async updateFeature(id:string,dto: CreateFeatureDto) {
    return this.featureService.update(id,dto);
  }
   async deleteFeature(id:string) {
    return this.featureService.delete(id)
  }

  async getFeatureById(id:string) {
    return this.featureService.getFeatureById(id)
  }
  

  async adminLogin(dto: LoginReqDto) {
    const user:any = await this.userService.findByEmailWithRoles(dto.email.toLowerCase());
    if (!user /*|| !user.roles?.some((role:any) => role.name?.toLowerCase() === RoleType.ADMIN?.toLowerCase())*/) throw new NotFoundException('Admin not found');
    
    if(!user.isActive) throw new NotFoundException('Admin is not active');

    if(user.enterpriseId){
      const enterprise = await this.userService.findByEnterpriseId(user.enterpriseId);
      if(!enterprise?.isActive) throw new NotFoundException('Enterprise is not active. Please contact admin.');
    }
    
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new NotFoundException('Invalid credentials');
     return await this.userService.signinJwt(user);
  }

  async adminForgotPassword(dto: ForgotPasswordDto) {
    // Find admin user by email
    const user:any = await this.userService.findByEmailWithRoles(dto.email);
    if (!user /*|| !user.roles?.some((role:any) => role.name?.toLowerCase() === RoleType.ADMIN?.toLowerCase())*/) throw new NotFoundException('User not found');
    return await this.userService.forgotPassword(dto.email, true);
     
  }
  async adminResetPassword(dto: ResetPasswordDto) {
    return  await this.userService.resetPassword(dto);
  }

  async getUserById(userId: string) {
    const user = await this.userService.findOneWithRoles(userId);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserById(userId: string, dto: UpdateUserDto) {
   await this.userService.updateUser(userId,dto);
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    await this.userService.updateUser(userId, { isActive: dto.isActive } as any);
    return { message: 'User status updated successfully' };
  }

  async updateUserType(userId: string, dto: UpdateUserTypeDto) {
    await this.userService.updateUser(userId, { userType: dto.userType } as any);
    return { message: 'User type updated successfully' };
  }

  async blockUser(userId: string, dto: BlockUserDto) {
    await this.userService.updateUser(userId, { isBlocked: dto.isBlocked } as any);
    return { message: `User ${dto.isBlocked ? 'blocked' : 'unblocked'} successfully` };
  }

  async deleteUserById(userId: string) {
    await this.userService.remove(userId);
  }

  async createUser(dto: UpdateUserDto) {
    const user = await this.userService.create(dto);
    return { message: 'User created successfully', user };    
  }
   async createFeaturePermission(dto: CreateUserFeaturePermissionDto) {
    return await this.featurePermissionService.createPermission(dto);   
  }

  async getFeaturePermission(roleId: string) {
    return await this.featurePermissionService.findByRoleId(roleId);   
  }

    async updateRole(id: string, dto: UpdateRoleDto) {
    return await this.roleService.update(id, dto);
  }

  async removeFeatureFromRole(roleId: string, featureId: string) {
    return await this.roleService.removeFeatureFromRole(roleId, featureId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    return await this.userService.changePassword(userId, dto)
  }
} 