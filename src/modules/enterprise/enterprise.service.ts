import { ConflictException, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Not } from 'typeorm';
import { Enterprise } from './entity/enterprise.entity';
import { CreateEnterpriseDto } from './dto/request/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/request/update-enterprise.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '@modules/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { EnterprisePaginatedResponseDto } from './dto/response/enterprise-paginated.dto';
import { plainToInstance } from 'class-transformer';
import { EnterpriseResponseDto } from './dto/response/enterprise-response.dto';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '@modules/role/role.service';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { ResendResetLinkDto } from './dto/request/resend-reset-link.dto';
import { AddEnterpriseUserDto } from './dto/request/add-enterprise-user.dto';
import { CreateEnterpriseUserDto } from '@modules/user/dto/create-enterprise-user.dto';
import { FeatureService } from '@modules/feature/feature.service';
import { UserFeaturePermissionService } from '@modules/user-feature-permission/user-feature-permission.service';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { UpdateEnterpriseUserDto } from './dto/request/update-enterprise-user.dto';
import { UpdateEnterpriseUserStatusDto } from './dto/request/update-enterprise-user-status.dto';
import { Feature } from '../feature/entities/feature.entity';
import { RoleType } from '@shared/enums/roleType';
import { RobustEmailService } from '@shared/email/robust-email.service';
import { generateEmailTemplate, generateEmailText } from '@shared/email/email-template.helper';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(Enterprise, 'mongo')
    private readonly repo: MongoRepository<Enterprise>,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
    private readonly featureService: FeatureService,
    private readonly userFeaturePermissionService: UserFeaturePermissionService,
    private readonly robustEmailService: RobustEmailService,
  ) {}

  async create(dto: CreateEnterpriseDto): Promise<EnterpriseResponseDto> {
    const existingEnterprise = await this.repo.findOne({ where: { enterpriseName: dto.enterpriseName } });
    if (existingEnterprise) {
      throw new ConflictException('Enterprise already exists. Please login to continue.');
    }
    
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('User already exists. Please login to continue.');
    }
    const enterpriseRoleName = `${dto.enterpriseName}_ADMIN`.toUpperCase().replaceAll(/ /g, '_');
    dto.features=dto.features?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);
    let savedRole: any;
    const enterpriseRole = await this.roleService.createEnterpriseRole(enterpriseRoleName, dto?.features?.map(feature => ({
      featureId: feature.featureId,
      permissions: feature.permissions,
    })) || []);
    savedRole = enterpriseRole.savedRole;
    dto.featurePermissionsIds = enterpriseRole.userFeaturePermissions.map(fp =>fp.id);

    const enterprise = this.repo.create({...dto, roleId: savedRole.id});
    const enterpriseCreated = await this.repo.save(enterprise);
    
    const token = uuidv4();
    await this.userService.saveEnterpriseUser({
      organizationName: enterpriseCreated.enterpriseName,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      countryCode: dto.countryCode,
      phoneNumber: dto.phoneNumber,
      isPhoneVerified: false,
      isEmailVerified: false,
      isEnterpriseAdmin: true,
      isActive: false,
      enterpriseId: enterpriseCreated.id.toString(),
      token: token,
      roleIds: savedRole?.id ? [savedRole.id] : [],
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state || '',
      pincode: dto.pincode || '',
      userType: 'ENTERPRISE',
    });
    const frontendUrl = this.configService.get('general.frontendUrl');
    const resetUrl = `${frontendUrl}/enterprise-management/reset-password?token=${token}`;
    const userName = dto.firstName || 'User';
    const emailHtml = generateEmailTemplate({
      userName,
      title: 'Reset Your Password',
      message: 'We received a request to reset your password for your <strong>WhizCloud Event Dashboard</strong> account. Click the button below to set a new password:',
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
      additionalInfo: 'This link will expire in 15 minutes.',
    });
    const emailText = generateEmailText({
      userName,
      message: 'We received a request to reset your password for your WhizCloud Event Dashboard account. Click the link below to set a new password:',
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
      additionalInfo: 'This link will expire in 15 minutes.',
    });
    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Reset Your Password - WhizCloud Events',
      text: emailText,
      html: emailHtml,
    });    
    return plainToInstance(EnterpriseResponseDto, enterpriseCreated, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<EnterprisePaginatedResponseDto> {
    const skip = (page - 1) * limit;
    const whereOptions: any = {isDeleted: false};
    if (search) {
      whereOptions['enterpriseName'] = { $regex: search.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), $options: 'i' };
    }
    
    const [data, total] = await Promise.all([
      this.repo.aggregate([
        { $match: whereOptions },
      
        {
          $lookup: {
            from: 'user_feature_permissions',
            localField: 'featurePermissionsIds',
            foreignField: '_id',
            as: 'featurePermissions'
          }
        },
      
        {
          $unwind: {
            path: '$featurePermissions',
            preserveNullAndEmptyArrays: true
          }
        },
      
        {
          $group: {
            _id: '$_id',
            id: { $first: '$_id' },
            key: { $first: '$key' },
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            enterpriseName: { $first: '$enterpriseName' },
            email: { $first: '$email' },
            countryCode: { $first: '$countryCode' },
            phoneNumber: { $first: '$phoneNumber' },
            description: { $first: '$description' },
            address: { $first: '$address' },
            city: { $first: '$city' },
            state: { $first: '$state' },
            pincode: { $first: '$pincode' },
            createdAt: { $first: '$createdAt' }, // include for sorting
            isActive: { $first: '$isActive' },
            features: {
              $push: {
                featureId: '$featurePermissions.featureId',
                permissions: {
                  read: '$featurePermissions.read',
                  write: '$featurePermissions.write',
                  admin: '$featurePermissions.admin'
                }
              }
            }
          }
        },
      
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]).toArray(),
      this.repo.countDocuments(whereOptions),
    ]);
    return {
      data: plainToInstance(EnterpriseResponseDto, data, { excludeExtraneousValues: true }),
      pagination: {
        total,
        szPage: page,
        szLimit: limit,
        totalPages: Math.ceil(total / limit)
      },
    };
  }

  async getEnterpriseList(search?: string) {
    const whereOptions: any = { isActive: true, isDeleted: false };
    if (search) {
      whereOptions['enterpriseName'] = { $regex: search.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), $options: 'i' };
    }
    const pipeline = [
      { $match: whereOptions },
      { $sort: { enterpriseName: 1 } },
      {
        $project: {
          id: '$_id',
          _id: 0,
          enterpriseName: 1
        }
      }
    ];
    return this.repo.aggregate(pipeline).toArray();
  }

  async findOneByKey(key: string) {
    const ent = await this.repo.aggregate([
      { $match: {key} },
    
      {
        $lookup: {
          from: 'user_feature_permissions',
          localField: 'featurePermissionsIds',
          foreignField: '_id',
          as: 'featurePermissions'
        }
      },
    
      {
        $unwind: {
          path: '$featurePermissions',
          preserveNullAndEmptyArrays: true
        }
      },
    
      {
        $group: {
          _id: '$_id',
          id: { $first: '$_id' },
          key: { $first: '$key' },
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          enterpriseName: { $first: '$enterpriseName' },
          email: { $first: '$email' },
          countryCode: { $first: '$countryCode' },
          phoneNumber: { $first: '$phoneNumber' },
          description: { $first: '$description' },
          address: { $first: '$address' },
          city: { $first: '$city' },
          state: { $first: '$state' },
          pincode: { $first: '$pincode' },
          features: {
            $push: {
              featureId: '$featurePermissions.featureId',
              permissions: {
                read: '$featurePermissions.read',
                write: '$featurePermissions.write',
                admin: '$featurePermissions.admin'
              }
            }
          }
        }
      }
    ]).toArray();
    console.log(ent);
    if (!ent.length) throw new NotFoundException('Enterprise not found by key');
    delete ent[0]._id;
    return ent[0]; 
  }

  async update(key: string, dto: UpdateEnterpriseDto): Promise<EnterpriseResponseDto> {
    const enterprise = await this.findOneByKey(key);
    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }
    console.log(enterprise.id.toString());
    const existingEnterprise = await this.repo.findOne({ where: {
      enterpriseName: dto.enterpriseName,
      id: Not(enterprise.id),
    }});
    if (existingEnterprise) {
      throw new ConflictException('Enterprise already exists. Please use a different enterprise name.');
    }
    // Prevent email change if user already exists with a different enterprise
    const existingUser = await this.userService.findByEmail(dto?.email || '');
    console.log(existingUser?.enterpriseId, enterprise.id);
    console.log(existingUser?.enterpriseId.toString(), enterprise.id.toString());
    if (existingUser && existingUser.enterpriseId?.toString() !== enterprise.id.toString()) {
      throw new ConflictException('Email already exists for another enterprise.');
    }
    const enterpriseRoleName = `${dto.enterpriseName}_ADMIN`.toUpperCase().replaceAll(/ /g, '_');
    const oldEnterpriseRoleName = `${enterprise.enterpriseName}_ADMIN`.toUpperCase().replaceAll(/ /g, '_');
    const enterpriseAdminRole = await this.roleService.findByName(oldEnterpriseRoleName);
    dto.features=dto.features?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);
    const {featurePermissionIds} = await this.roleService.updateEnterpriseRole(enterpriseAdminRole.id.toString(), enterpriseRoleName, dto?.features?.map(feature => ({
      featureId: feature.featureId,
      permissions: feature.permissions,
    })) || []);
    // if(dto.enterpriseName !== enterprise.enterpriseName) {
    //   let savedRole: Role = enterpriseAdminRole;
    //     const enterpriseRole = await this.roleService.createEnterpriseRole(enterpriseRoleName, dto?.features?.map(feature => ({
    //       featureId: feature.featureId,
    //       permissions: feature.permissions,
    //     })) || []);
    //     await this.roleService.deleteEnterpriseRole(oldEnterpriseRoleName);
    //     savedRole = enterpriseRole.savedRole;
    //     dto.featurePermissionsIds = enterpriseRole.userFeaturePermissions.map(fp => new ObjectId(fp.id));
    // } else {
    //   await this.roleService.updateEnterpriseRole(enterpriseAdminRole.id.toString(), dto?.features?.map(feature => ({
    //     featureId: feature.featureId,
    //     permissions: feature.permissions,
    //   })) || []);
    // }

    Object.assign(enterprise, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      countryCode: dto.countryCode,
      phoneNumber: dto.phoneNumber,
      enterpriseName: dto.enterpriseName,
      description: dto.description,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      featurePermissionsIds: featurePermissionIds,
      updatedAt: new Date(),
    });
    const updatedEnt = await this.repo.save(enterprise);
    return plainToInstance(EnterpriseResponseDto, updatedEnt, { excludeExtraneousValues: true });
  }

  async delete(key: string): Promise<{message: string}> {
    const ent = await this.findOneByKey(key);
    if (!ent) throw new NotFoundException('Enterprise not found for deletion');
    await this.repo.updateOne({ key }, { $set: { isDeleted: true, isActive: false } });
    return { message: 'Enterprise deleted successfully' };
  }

  async resetPassword(token: string, dto: ResetPasswordDto): Promise<{message: string}> {
    const user = await this.userService.findByToken(token);
    if (!user) throw new NotFoundException('User not found for verification');
    await this.userService.resetEnterprisePassword(user.id.toString(), dto.password);
    return { message: 'Password reset successfully' };
  }

  async resendResetLink(currentUser: any, dto: ResendResetLinkDto): Promise<{ message: string }> {
    // Validate enterprise context and permissions
    const isSuperAdmin = currentUser.roles.some((role: any) => role.name.toLowerCase() === RoleType.SUPER_ADMIN.toLowerCase());
    const requester = await this.userService.findByEmailWithRoles(currentUser.email);
    const isEnterpriseAdmin = requester?.roles?.some((r: any) => r.name?.includes('_ADMIN'));
    if (!isEnterpriseAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only enterprise admins can resend reset link');
    }

    console.log(dto.email);
    // Find target user by email
    const targetUser = await this.userService.findByEmail(dto.email);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Ensure target belongs to same enterprise unless super admin
    if (!isSuperAdmin && targetUser.enterpriseId?.toString() !== currentUser.enterpriseId?.toString()) {
      throw new ForbiddenException('User does not belong to your enterprise');
    }

    // Generate new token and save
    const token = uuidv4();
    await this.userService.updateEnterpriseUser(targetUser.id.toString(), { token } as any);

    // Send reset password email using robust email service
    const frontendUrl = this.configService.get('general.frontendUrl');
    const resetUrl = `${frontendUrl}/enterprise-management/reset-password?token=${token}`;
    
    console.log(`📧 Sending enterprise password reset email to ${targetUser.email} using robust email service...`);
    const emailSent = await this.robustEmailService.sendEmail(
      targetUser.email,
      'Reset Your Password',
      `Click the link to reset your password: ${resetUrl}`
    );

    if (emailSent) {
      console.log(`✅ Enterprise password reset email sent successfully to ${targetUser.email}`);
    } else {
      console.log(`📝 Enterprise password reset email for ${targetUser.email} (Email delivery failed, but reset link is available in logs)`);
      console.log('📧 User can use this reset link to reset their password manually');
      console.log(`Reset Link: ${resetUrl}`);
    }
    return { message: 'Reset link sent successfully' };
  }

  async addEnterpriseUser(currentUser: any, dto: AddEnterpriseUserDto): Promise<{ message: string; }> {
    // Verify user has enterprise context
    const isSuperAdmin = currentUser.roles.some((role: any) => role.name.toLowerCase() === RoleType.SUPER_ADMIN.toLowerCase());
    let enterpriseUser: any;
    if (!currentUser.enterpriseId && !isSuperAdmin) {
      throw new BadRequestException('Enterprise ID not found in user context');
    }
    if(dto.enterpriseId && isSuperAdmin){
      enterpriseUser = await this.userService.findByEnterpriseId(dto.enterpriseId);
    } else {
      enterpriseUser = currentUser;
    }

    // Get current user's detailed info with roles
    const userWithRoles: any = await this.userService.findByEmailWithRoles(enterpriseUser.email);
    if (!userWithRoles || !userWithRoles.roles || userWithRoles.roles.length === 0) {
      throw new NotFoundException('User roles not found');
    }

    // Check if user has enterprise admin role (role name contains _ADMIN)
    const isEnterpriseAdmin = userWithRoles.roles.some((role: any) => 
      role.name && role.name.includes('_ADMIN')
    );
    
    if (!isEnterpriseAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only enterprise admins can add users');
    }

    // Get enterprise details
    const enterprise = await this.repo.findOne({ where: { _id: new ObjectId(dto.enterpriseId || currentUser.enterpriseId) } });
    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }

    // If enterprise is inactive, block adding users
    if (!enterprise.isActive) {
      throw new ForbiddenException('Enterprise is inactive. Cannot add users.');
    }

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Extract role name from current user's enterprise admin role
    const adminRole = userWithRoles.roles.find((role: any) => role.name.includes('_ADMIN'));
    // const enterprisePrefix = adminRole.name.replace('_ADMIN', '');
    
    // Create new role name: {enterprisePrefix}_{roleNameSuffix}_User
    const newRoleName = `${adminRole.name}_USER_${new Date().getTime()}`.replaceAll(/ /g, '_');

    // Create the role with features
    dto.features=dto.features?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);
    const roleResult = await this.roleService.createEnterpriseRole(newRoleName, dto.features);

    // Generate token for reset password flow (no temporary password)
    const token = uuidv4();

    // Prepare user data
    const userData: CreateEnterpriseUserDto = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      organizationName: dto.organizationName || enterprise.enterpriseName,
      countryCode: dto.countryCode,
      phoneNumber: dto.phoneNumber,
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state || '',
      pincode: dto.pincode || '',
      enterpriseId: currentUser.enterpriseId ? currentUser.enterpriseId : dto.enterpriseId,
      roleIds: [roleResult.savedRole.id],
      token: token,
      isActive: true,
      isDeleted: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      // password will be set after user completes reset via email
      isEnterpriseAdmin: false, // New users are not enterprise admins by default
      userType: 'ENTERPRISE_USER'
    };

    // Save the user
    await this.userService.saveEnterpriseUser(userData);

    // Send reset password email instead of welcome with temporary password
    const frontendUrl = this.configService.get('general.frontendUrl');
    const resetUrl = `${frontendUrl}/enterprise-management/reset-password?token=${token}`;
    const userName = dto.firstName || dto.organizationName || 'User';
    const emailHtml = generateEmailTemplate({
      userName,
      title: `Welcome to ${enterprise.enterpriseName}`,
      message: `Your account has been created for <strong>${enterprise.enterpriseName}</strong>. Click the button below to set your password and activate your account:`,
      buttonText: 'Set Password',
      buttonUrl: resetUrl,
      additionalInfo: 'This link will expire in 15 minutes.',
    });
    const emailText = generateEmailText({
      userName,
      message: `Your account has been created for ${enterprise.enterpriseName}. Click the link below to set your password and activate your account:`,
      buttonText: 'Set Password',
      buttonUrl: resetUrl,
      additionalInfo: 'This link will expire in 15 minutes.',
    });
    await this.mailerService.sendMail({
      to: dto.email,
      subject: `Welcome to ${enterprise.enterpriseName} - WhizCloud Events`,
      text: emailText,
      html: emailHtml,
    });

    return {
      message: 'User created successfully'
    };
  }

  async getAccessibleFeatures(currentUser: any, enterpriseId?: string): Promise<{ features: any[] }> {
    // Verify user has enterprise context
    const isSuperAdmin = currentUser.roles.some((role: any) => role.name.toLowerCase() === RoleType.SUPER_ADMIN.toLowerCase());
    
    // If no enterpriseId is provided but user has enterpriseId, use user's enterpriseId
    if (!enterpriseId && currentUser?.enterpriseId && !isSuperAdmin) {
      enterpriseId = currentUser.enterpriseId;
    }
    
    let enterprise: any;
    if(enterpriseId){
      enterprise = await this.repo.findOne({ where: { _id: new ObjectId(enterpriseId) } });
      if (!enterprise) {
        throw new NotFoundException('Enterprise not found');
      }
    }

    const email = enterpriseId ? enterprise.email : currentUser.email;

    // Get current user's detailed info with roles
    const userWithRoles: any = await this.userService.findByEmailWithRoles(email);
    if (!userWithRoles?.roles?.length) {
      throw new NotFoundException('User roles not found');
    }
    
    if (!userWithRoles.isEnterpriseAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only enterprise admins can access this endpoint');
    }

    // Collect all accessible features with permissions
    let accessibleFeatures = userWithRoles.roles.flatMap((role: any) => {
      return role.features.map((feature: any) => {
        return {
          id: feature.id,
          name: feature.name,
          permissions: {
            read: feature.permission?.read || false,
            write: feature.permission?.write || false,
            admin: feature.permission?.admin || false,
          },
        };
      });
    }
    );

    accessibleFeatures = accessibleFeatures.filter((fp:any) => fp.permissions.read || fp.permissions.write || fp.permissions.admin);

    return { features: accessibleFeatures };
  }

  async getEnterpriseUsers(currentUser: any, filters: {
    search?: string;
    enterpriseId?: string;
    page?: number;
    limit?: number;
  }) {
    return this.userService.findAllForEnterpriseUsers(currentUser, filters);
  }
  async getEnterpriseUser(userId: string) {
    // Return the same projected shape as list endpoint
    return this.userService.findEnterpriseUserByIdProjected(userId);
  }

  async updateEnterpriseUser(currentUser: any, userId: string, dto: UpdateEnterpriseUserDto) {
    const target = await this.userService.findById(userId);
    if (!target) throw new NotFoundException('User not found');
    if (target.enterpriseId?.toString() !== currentUser.enterpriseId?.toString()) {
      throw new ForbiddenException('User does not belong to your enterprise');
    }

    // If features array provided, create/update enterprise-scoped role for this user
    dto.features=dto.features?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);

    if (dto.features && dto.features.length > 0) {
      // Determine enterprise admin role name for prefix
      const currentWithRoles: any = await this.userService.findByEmailWithRoles(currentUser.email);
      const adminRole = currentWithRoles.roles.find((r: any) => r.name?.includes('_ADMIN'));
      if (!adminRole) throw new ForbiddenException('Missing enterprise admin role');
      const roleName = `${adminRole.name}_USER`.replaceAll(/ /g, '_');

      // Create or update role for this enterprise user
      let role = await this.roleService.findByName(roleName);
      if (!role) {
        const created = await this.roleService.createEnterpriseRole(roleName, dto.features);
        role = created.savedRole;
      } else {
        await this.roleService.updateEnterpriseRole(role.id.toString(), roleName, dto.features);
      }

      if(dto.password && dto.password !== ''){
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;
      } else {
        dto.password = target.password;
      }
      // Assign the role to user (replace or add)
      const userObj = {
        ...dto,
        roleIds: [role.id],
      }
      await this.userService.updateEnterpriseUser(userId, userObj as any);
      const userName = target.firstName || target.organizationName || 'User';
      const emailHtml = generateEmailTemplate({
        userName,
        title: 'Password Reset',
        message: `Your password has been reset. Your new temporary password is: <strong>${dto.password}</strong>. Please log in and change your password immediately.`,
        additionalInfo: 'For security reasons, please change your password after logging in.',
      });
      const emailText = generateEmailText({
        userName,
        message: `Your password has been reset. Your new temporary password is: ${dto.password}. Please log in and change your password immediately.`,
        additionalInfo: 'For security reasons, please change your password after logging in.',
      });
      await this.mailerService.sendMail({
        to: target.email,
        subject: 'Password Reset - WhizCloud Events',
        text: emailText,
        html: emailHtml,
      });
    }

    return { message: 'Enterprise user updated successfully' };
  }

  async updateEnterpriseUserStatus(currentUser: any, userId: string, dto: UpdateEnterpriseUserStatusDto) {
    const target = await this.repo.findOne({ where: { _id: new ObjectId(userId) } });
    if (!target) throw new NotFoundException('User not found');
    const user = await this.userService.findByEmail(target.email);
    if (!user) throw new NotFoundException('User not found in user service');
    const isSuperAdmin = currentUser.roles.some((role: any) => role.name.toLowerCase() === RoleType.SUPER_ADMIN.toLowerCase());

    // Ensure same enterprise unless super admin
    if (!isSuperAdmin && target.id?.toString() !== currentUser.enterpriseId?.toString()) {
      throw new ForbiddenException('User does not belong to your enterprise');
    }

    // Update target user's status
    await this.userService.updateEnterpriseUser(userId, { isActive: dto.isActive } as any);

    // If deactivating an enterprise admin, cascade to all enterprise users
    if (user.isEnterpriseAdmin && dto.isActive === false) {
      await this.repo.updateOne(
        { _id: new ObjectId(user.enterpriseId) },
        { $set: { isActive: false } },
      );

      // Deactivate all users under this enterprise
      await this.userService.setUsersActiveByEnterpriseId(user.enterpriseId, false);
    }

    return { message: 'User status updated successfully' };
  }
}

