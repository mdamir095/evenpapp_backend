import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Repository, Unique } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginReqDto } from '@shared/dto/login.req.dto';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { LoginResDto, IAuthPayload } from '@shared/dto/login.res.dto';
import { SignUpReqDto } from '@modules/auth/dto/request/sign-up.req.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { RoleService } from '@modules/role/role.service';
import { FeatureService } from '@modules/feature/feature.service';
import { ResetPasswordDto } from '@modules/auth/dto/request/reset-password.req.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';
import { RoleType } from '@shared/enums/roleType';
import { FeatureType } from '@shared/enums/featureType';
import { SendPhoneOtpDto } from '@modules/auth/dto/request/send-phone-otp.req.dto';
import { ChangePasswordDto } from '@modules/admin/dto/request/change-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { AwsS3Service } from '@core/aws/services/aws-s3.service';
import { ResetPasswordMobileDto } from '@modules/auth/dto/request/reset-password-mobile.req.dto';
import { CreateEnterpriseUserDto } from './dto/create-enterprise-user.dto';
import path from 'path';
import fs from 'fs';
import { SupabaseService } from '@shared/modules/supabase/supabase.service';
import { SimpleEmailService } from '@shared/email/simple-email.service';
import { RobustEmailService } from '@shared/email/robust-email.service';
@Injectable()
export class UserService {
  private generalConfig;
  private jwtConfig;
  private awsConfig;
  constructor(
    @InjectRepository(User, 'mongo')
    private readonly userRepository: MongoRepository<User>,
    private readonly roleService: RoleService,
    private readonly featureService: FeatureService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly awsS3Service: AwsS3Service,
    private readonly supabaseService: SupabaseService,
    private readonly simpleEmailService: SimpleEmailService,
    private readonly robustEmailService: RobustEmailService,
  ) {
    this.generalConfig = this.configService.get('general');
    this.jwtConfig = this.configService.get('jwt');
    this.awsConfig = this.configService.get('aws');
  }

  async signup(body: SignUpReqDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findOneBy({
      email: body.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const existingUserByPhone = await this.userRepository.findOneBy({
      countryCode: body.countryCode,
      phoneNumber: body.phoneNumber,
    });
    if (existingUserByPhone) {
      throw new ConflictException('Phone number already registered');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    // 1. Find or create the default role and feature
    let defaultRole = await this.roleService.findByName(RoleType.USER);
    if (!defaultRole) {
      let userFeature = await this.featureService.findByName(FeatureType.USER);
      if (!userFeature) {
        userFeature = await this.featureService.create({
          name: FeatureType.USER,
          isActive: true
        });
      }
      // Create the 'User' role with the 'user' feature
      defaultRole = await this.roleService.save({
        name: RoleType.USER,
        featureIds: [new ObjectId(userFeature.id)],
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = this.userRepository.create({
      ...body,
      password: hashedPassword,
      roleIds: [defaultRole.id],
      otp: otp,
      expireAt: expiresAt,
      isMobileAppUser: true,
      userType: 'USER',
    });

    await this.userRepository.save(user);
    
    try {
      console.log(`Attempting to send OTP email to ${body.email}...`);
      await this.mailerService.sendMail({
        to: body.email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`,
      });
      console.log(`✅ Signup OTP sent successfully to ${body.email}: ${otp}`);
    } catch (error) {
      console.error('❌ Email sending failed during signup:', error.message);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response
      });
      console.log(`📝 Signup OTP for ${body.email}: ${otp} (Email service unavailable)`);
      console.log('📧 User can use this OTP to verify their account manually');
      // Don't throw error, just log it and continue
      // This allows the user to be created even if email fails
    }

    return { message: 'User registered successfully' };
  }

  async verify(payload: any) {
    const user = await this.userRepository.findOne({
      where: { email: payload.email },
      relations: ['roles', 'roles.features']
    });
    if (!user) {
      throw new UnauthorizedException('Invalid Authorization');
    }
    return user;
  }

  async validateLogin(payload: LoginReqDto): Promise<User> {
    const { email, password } = payload;
    console.log(`Login attempt for: ${email}`);
    
    // Debug: Check database connection and collection
    try {
      const userCount = await this.userRepository.count();
      console.log(`Total users in database: ${userCount}`);
      
      // Try to find any user first
      const anyUser = await this.userRepository.findOne({});
      console.log(`Any user found: ${!!anyUser}`);
      if (anyUser) {
        console.log(`Sample user email: ${anyUser.email}`);
      }
    } catch (error) {
      console.log(`Database query error: ${error.message}`);
    }
    
    // Try different query approaches
    console.log(`Searching for email: "${email}"`);
    
    // Method 1: Standard query
    let user = await this.userRepository.findOne({ where: { email: email } });
    console.log(`Method 1 - User found: ${!!user}`);
    
    if (!user) {
      // Method 2: Case insensitive search
      user = await this.userRepository.findOne({ where: { email: { $regex: new RegExp(`^${email}$`, 'i') } } });
      console.log(`Method 2 - Case insensitive search: ${!!user}`);
    }
    
    if (!user) {
      // Method 3: Find all users and filter
      const allUsers = await this.userRepository.find({});
      console.log(`Method 3 - All users count: ${allUsers.length}`);
      allUsers.forEach((u, index) => {
        console.log(`User ${index + 1}: email="${u.email}", match=${u.email === email}`);
      });
      user = allUsers.find(u => u.email === email) || null;
      console.log(`Method 3 - Found user: ${!!user}`);
    }
    
    console.log(`Final user found: ${!!user}`);
    
    if (user) {
      let match = await bcrypt.compare(password, user.password);
      console.log(`Password match: ${match}`);
      console.log(`User status - isBlocked: ${user.isBlocked}, isMobileAppUser: ${user.isMobileAppUser}, isActive: ${user.isActive}`);
      
      if (match && !user.isBlocked && (user.isMobileAppUser || (user.isActive && !user.isMobileAppUser))) {
        console.log('Login successful');
        return user;
      } else {
        console.log('Login failed - conditions not met');
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      console.log('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async signinJwt(result: any) {
    // Get user with populated roles and features
    const userWithRoles = await this.findOneWithRoles(result.id);
    
    // Extract roles from the populated user data
    let roles: any = [];
    if (userWithRoles && userWithRoles.roles) {
      roles = userWithRoles.roles;
    } else if (result.roleIds && result.roleIds.length > 0) {
      // Fallback: If roles are not populated but roleIds exist, create a basic roles structure
      roles = result.roleIds.map((roleId: any) => ({
        id: roleId,
        name: 'USER', // Default role name
        features: [] // Empty features for now
      }));
    }

    const tokenPayload = {
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      organizationName: result.organizationName,
      roles: roles,
      features: roles
        .flatMap((role: any) => role.features || [])
        .map((feature: any) => feature.name),
      id: result.id,
      enterpriseId: result.enterpriseId || null,
    };
    const options: any = {
      expiresIn: this.jwtConfig.expireTime,
      issuer: this.jwtConfig.jwtIssuer,
    };
    const token = jwt.sign(tokenPayload, this.jwtConfig.secret, options);
    const payload: IAuthPayload = {
      id: result.id.toString(),
      accessToken: token,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      organizationName: result.organizationName,
      roles: roles,
      profileImage: result.profileImage,
      isEmailVerified: result.isEmailVerified,
      isActive: result.isActive,
      enterpriseId: result.enterpriseId || null,
    };

    return payload;
  }

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
      // Or, if you want to create a user here, do so explicitly
    }

    // Update OTP and expiry
    user.otp = otp;
    user.expireAt = expiresAt;
    await this.userRepository.save(user);

    // Use robust email service with multiple fallback strategies
    console.log(`📧 Sending OTP email to ${email} using robust email service...`);
    const emailSent = await this.robustEmailService.sendEmail(
      email,
      'Your OTP Code',
      `Your OTP is ${otp}`
    );
    
    if (emailSent) {
      console.log(`✅ OTP email sent successfully to ${email}: ${otp}`);
    } else {
      console.log(`📝 OTP for ${email}: ${otp} (Email delivery failed, but OTP is available in logs)`);
      console.log('📧 User can use this OTP to verify their account manually');
    }

    return { message: 'OTP sent' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email, otp } });
    if (!user || !user.expireAt || user.expireAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    // Mark user as verified
    user.isEmailVerified = true;
    user.isActive = true;
    // Optionally, clear OTP fields
    user.otp = '';
    user.expireAt = null;
    await this.userRepository.save(user);
    return await this.signinJwt(user);
    //return { message: 'Email verified' };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async createFromGoogle(payload: any) {
    const user = this.userRepository.create({
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      isEmailVerified: payload.email_verified,
      // ...any other fields you want to set
    });
    return this.userRepository.save(user);
  }

  async findByPhoneNumber(countryCode: string, phoneNumber: string) {
    return this.userRepository.findOneBy({
      countryCode: countryCode,
      phoneNumber: phoneNumber,
    });
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }

  async createWithPhone(dto: SendPhoneOtpDto) {
    const user = this.userRepository.create({
      countryCode: dto.countryCode,
      phoneNumber: dto.phoneNumber,
    });
    return this.userRepository.save(user);
  }

  async findById(id: string) {
    return this.userRepository.findOneBy({ _id: new ObjectId(id) });
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<User> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userRepository.findOne({ where: { _id: new ObjectId(userId) } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { fcmToken: fcmToken } }
    );

    // Return updated user
    const updatedUser = await this.userRepository.findOne({ where: { _id: new ObjectId(userId) } as any });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  async findAll(currentUser: any, {
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
    roleName?: string;
    page?: number;
    limit?: number;
  }) {
    const matchConditions: any = { isDeleted: false, isMobileAppUser: true, _id: { $ne: new ObjectId(currentUser.id) } };

    if (email) {
      matchConditions.email = { $regex: email, $options: 'i' };
    }
    if (firstName)
      matchConditions.firstName = { $regex: firstName, $options: 'i' };
    if (lastName)
      matchConditions.lastName = { $regex: lastName, $options: 'i' };
    if (organizationName)
      matchConditions.organizationName = {
        $regex: organizationName,
        $options: 'i',
      };
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchConditions.$or = [
        { firstName: { $regex: safe, $options: 'i' } },
        { lastName: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
        { organizationName: { $regex: safe, $options: 'i' } },
      ];
    }
    const pipeline: any[] = [
      { $match: matchConditions },

      {
        $lookup: {
          from: 'roles',
          localField: 'roleIds',
          foreignField: '_id',
          as: 'roles',
        },
      },

      ...(roleName
        ? [
            {
              $match: {
                'roles.name': roleName,
              },
            },
          ]
        : []),

      {
        $unwind: {
          path: '$roles',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'features',
          localField: 'roles.featureIds',
          foreignField: '_id',
          as: 'roles.features',
        },
      },

      {
        $group: {
          _id: '$_id',
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          email: { $first: '$email' },
          password: { $first: '$password' },
          phoneNumber: { $first: '$phoneNumber' },
          countryCode: { $first: '$countryCode' },
          organizationName: { $first: '$organizationName' },
          key: { $first: '$key' },
          isActive: { $first: '$isActive' },
          isBlocked: { $first: '$isBlocked' },
          isEmailVerified: { $first: '$isEmailVerified' },
          created: { $first: '$created' },
          modified: { $first: '$modified' },
          roleIds: { $first: '$roleIds' },
          roles: { $push: '$roles' },
        },
      },

      {
        $project: {
          id: '$_id',
          _id: 0,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          countryCode: 1,
          organizationName: 1,
          key: 1,
          isActive: 1,
          isBlocked: 1,
          isEmailVerified: 1,
          created: 1,
          modified: 1,
          roleIds: 1,
          roles: 1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await this.userRepository.aggregate(pipeline).toArray();

    const total = await this.userRepository.countDocuments(matchConditions);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllForEnterpriseUsers(currentUser: any, {
    search,
    enterpriseId,
    page = 1,
    limit = 10,
  }: {
    enterpriseId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const loggedinUser = await this.userRepository.findOneBy({ _id: new ObjectId(currentUser.id) });
    const matchConditions: any = { isDeleted: false, isMobileAppUser: false, _id: { $ne: new ObjectId(currentUser.id) } };
    const isSuperAdmin = currentUser.roles.some((role: any) => role.name.toLowerCase() === RoleType.SUPER_ADMIN.toLowerCase());
    if(isSuperAdmin) {
      if(enterpriseId) {
        matchConditions.enterpriseId = enterpriseId;
      }
    } else if(loggedinUser?.isEnterpriseAdmin) {
      matchConditions.enterpriseId = currentUser.enterpriseId;
      matchConditions.isEnterpriseAdmin = false;
    } else {
      matchConditions.enterpriseId = currentUser.enterpriseId;
      matchConditions.isEnterpriseAdmin = false;
      matchConditions._id = { $ne: new ObjectId(currentUser.id) }; // Exclude the logged-in user
    }

    if (search) {
      matchConditions.$or = [
        { firstName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { lastName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { organizationName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ];
    }

    const pipeline: any[] = [
      { $match: matchConditions },

      // Join enterprise to fetch enterprise details fields
      {
        $lookup: {
          from: 'enterprise',
          let: { entId: '$enterpriseId' },
          pipeline: [
            { $addFields: { idStr: { $toString: '$_id' } } },
            { $match: { $expr: { $eq: ['$idStr', '$$entId'] } } },
            {
              $project: {
                _id: 0,
                enterpriseName: '$enterpriseName',
                description: 1,
                address: 1,
                city: 1,
                state: 1,
                pincode: 1,
              },
            },
          ],
          as: 'enterpriseDoc',
        },
      },
      { $unwind: { path: '$enterpriseDoc', preserveNullAndEmptyArrays: true } },

      // Build role-based feature permissions
      {
        $lookup: {
          from: 'user_feature_permissions',
          let: {
            roleIdsStr: {
              $map: {
                input: '$roleIds',
                as: 'rid',
                in: { $toString: '$$rid' },
              },
            },
          },
          pipeline: [
            { $match: { $expr: { $in: ['$roleId', '$$roleIdsStr'] } } },
            {
              $project: {
                _id: 0,
                featureId: 1,
                permissions: {
                  read: '$read',
                  write: '$write',
                  admin: '$admin',
                },
              },
            },
          ],
          as: 'featurePermissions',
        },
      },

      {
        $project: {
          id: '$_id',
          _id: 0,
          firstName: 1,
          lastName: 1,
          email: 1,
          countryCode: 1,
          phoneNumber: 1,
          organizationName: 1,
          enterpriseName: '$enterpriseDoc.enterpriseName',
          address: 1,
          city: 1,
          state:1,
          pincode: 1,
          isActive: 1,
          features: {
            $map: {
              input: '$featurePermissions',
              as: 'fp',
              in: {
                featureId: '$$fp.featureId',
                permissions: '$$fp.permissions',
              },
            },
          },
        },
      },

      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const [ data, total] = await Promise.all([ 
      this.userRepository.aggregate(pipeline).toArray(),
      this.userRepository.countDocuments(matchConditions)
    ]);

    return { 
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      } 
    };
  }

  async findEnterpriseUserByIdProjected(userId: string) {
    const matchConditions: any = {
      _id: new ObjectId(userId),
      isDeleted: false,
    };
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'enterprise',
          let: { entId: '$enterpriseId' },
          pipeline: [
            { $addFields: { idStr: { $toString: '$_id' } } },
            { $match: { $expr: { $eq: ['$idStr', '$$entId'] } } },
            {
              $project: {
                _id: 0,
                enterpriseName: '$enterpriseName',
                description: 1,
                address: 1,
                city: 1,
                state: 1,
                pincode: 1,
              },
            },
          ],
          as: 'enterpriseDoc',
        },
      },
      { $unwind: { path: '$enterpriseDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'user_feature_permissions',
          let: {
            roleIdsStr: {
              $map: {
                input: '$roleIds',
                as: 'rid',
                in: { $toString: '$$rid' },
              },
            },
          },
          pipeline: [
            { $match: { $expr: { $in: ['$roleId', '$$roleIdsStr'] } } },
            {
              $project: {
                _id: 0,
                featureId: 1,
                permissions: {
                  read: '$read',
                  write: '$write',
                  admin: '$admin',
                },
              },
            },
          ],
          as: 'featurePermissions',
        },
      },

      {
        $project: {
          _id: 0,
          id: '$_id',
          firstName: 1,
          lastName: 1,
          email: 1,
          countryCode: 1,
          organizationName: 1,
          phoneNumber: 1,
          enterpriseName: '$enterpriseDoc.enterpriseName',
          enterpriseId: '$enterpriseDoc._id',
          description: 1,
          address: 1,
          city: 1,
          state: 1,
          pincode: 1,
          isActive: 1,
          isBlocked: 1,
          features: {
            $map: {
              input: '$featurePermissions',
              as: 'fp',
              in: {
                featureId: '$$fp.featureId',
                permissions: '$$fp.permissions',
              },
            },
          },
        },
      },

      { $limit: 1 },
    ];

    const docs = await this.userRepository.aggregate(pipeline).toArray();
    if (!docs || docs.length === 0) {
      throw new NotFoundException('User not found');
    }
    return docs[0];
  }

  async updateUser(id: string, userData: Partial<UpdateUserDto>) {
    const user = await this.userRepository.findOneBy({ _id: new ObjectId(id) });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { email, phoneNumber, roleIds, ...safeData } = userData;
    if (roleIds && roleIds.length > 0) {
      // const objectIdRoleIds = roleIds.map((id) => new ObjectId(id));
      // const roles = await this.roleService.findByIds(objectIdRoleIds);

      // if (roles.length !== roleIds.length) {
      //   const foundIds = roles.map((r) => r.id.toString());
      //   const missing = roleIds.filter((id) => !foundIds.includes(id));
      //   throw new BadRequestException(
      //     `Invalid role IDs: ${missing.join(', ')}`,
      //   );
      // }
      // // Merge with existing roles and deduplicate
      // const existingRoleIds = (user.roleIds || []).map((id) => id.toString());
      // const newRoleIds = roles.map((r) => r.id.toString());

      // const mergedRoleIds = Array.from(
      //   new Set([...existingRoleIds, ...newRoleIds]),
      // ).map((id) => new ObjectId(id));

      user.roleIds = roleIds.map((id) => new ObjectId(id));
    }
    Object.assign(user, safeData);
    return this.userRepository.save(user);
  }

  async findByEmailWithRoles(email: string) {
    const users = await this.userRepository
      .aggregate([
        // Match user by email
        { $match: { email: email } },
        // Lookup roles
        {
          $lookup: {
            from: 'roles',
            localField: 'roleIds',
            foreignField: '_id',
            as: 'roles',
          },
        },
        // Unwind roles to process each separately
        { $unwind: '$roles' },

        // Lookup features of the current role
        {
          $lookup: {
            from: 'features',
            localField: 'roles.featureIds',
            foreignField: '_id',
            as: 'roleFeatures',
          },
        },

        // Lookup permissions for this role's features
        {
          $lookup: {
            from: 'user_feature_permissions',
            localField: 'roleId',
            foreignField: 'roles._id',
            as: 'rolePermissions',
          },
        },

        // Embed permission info inside each feature
        {
          $addFields: {
            'roles.features': {
              $map: {
                input: '$roleFeatures',
                as: 'feature',
                in: {
                  id: '$$feature._id',
                  name: '$$feature.name',
                  uniqueId: '$$feature.uniqueId',
                  permission: {
                    $let: {
                      vars: {
                        perm: {
                          $first: {
                            $filter: {
                              input: '$rolePermissions',
                              as: 'p',
                              cond: {
                                $and: [
                                  {
                                    $eq: [
                                      { $toString: '$$p.featureId' },
                                      { $toString: '$$feature._id' },
                                    ],
                                  },
                                  {
                                    $eq: [
                                      { $toString: '$$p.roleId' },
                                      { $toString: '$roles._id' },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                      },
                      in: {
                        read: { $ifNull: ['$$perm.read', false] },
                        write: { $ifNull: ['$$perm.write', false] },
                        admin: { $ifNull: ['$$perm.admin', false] },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // Group back by user to merge all role-feature-permissions into one user object
        {
          $group: {
            _id: '$_id',
            id: { $first: '$_id' },
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            email: { $first: '$email' },
            password: { $first: '$password' },
            organizationName: { $first: '$organizationName' },
            profileImage: { $first: '$profileImage' },
            isEmailVerified: { $first: '$isEmailVerified' },
            isActive: { $first: '$isActive' },
            enterpriseId: { $first: '$enterpriseId' },
            gender: { $first: '$gender' },
            birthday: { $first: '$birthday' },
            isEnterpriseAdmin: { $first: '$isEnterpriseAdmin' },
            address: { $first: '$address' },
            city: { $first: '$city' },
            state: { $first: '$state' },
            pincode: { $first: '$pincode' },
            roles: {
              $push: {
                id: '$roles._id',
                name: '$roles.name',
                features: '$roles.features',
              },
            },
          },
        },
      ])
      .toArray();

    if (users.length === 0) {
      // If no user found with roles, try to get basic user info
      const basicUser = await this.userRepository.findOne({
        where: { email: email },
      });
      if (basicUser) {
        return {
          id: basicUser.id,
          firstName: basicUser.firstName,
          lastName: basicUser.lastName,
          email: basicUser.email,
          password: basicUser.password,
          roles: [],
        };
      }
      return null;
    }

    return users[0];
  }
  async forgotPassword(email: string, isAdmin: boolean = false) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // 2. Generate reset token
    const token = jwt.sign({ userId: user.id }, this.jwtConfig.secret, {
      expiresIn: '15m', // Token expires in 15 minutes
      issuer: this.jwtConfig.jwtIssuer,
    });

    // 3. Build reset URL
    const resetUrl = isAdmin
      ? `${this.generalConfig.frontendUrl}/admin/reset-password?token=${token}`
      : `${this.generalConfig.frontendUrl}/reset-password?token=${token}&email=${email}`;

    // 4. Send email using robust email service
    console.log(`📧 Sending password reset email to ${user.email} using robust email service...`);
    const emailSent = await this.robustEmailService.sendEmail(
      user.email,
      'Reset Password',
      `Click the link to reset your password: ${resetUrl}`
    );

    if (emailSent) {
      console.log(`✅ Password reset email sent successfully to ${user.email}`);
    } else {
      console.log(`📝 Password reset email for ${user.email} (Email delivery failed, but reset link is available in logs)`);
      console.log('📧 User can use this reset link to reset their password manually');
      console.log(`Reset Link: ${resetUrl}`);
    }

    return {
      message: 'Reset password link sent to your email',
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    // 1. Verify token
    let payload: any;
    try {
      payload = jwt.verify(token, this.jwtConfig.secret);
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    // 2. Find user by  email or token payload
    if (!payload.userId) {
      throw new BadRequestException('Invalid token payload');
    }
    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(payload.userId),
    });
    if (!user) throw new NotFoundException('User not found');

    // 3. Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    // 4. send confirmation email
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully.',
    });
    return { message: 'Password reset successful' };
  }

  async findOneWithRoles(id: any) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const users = await this.userRepository
      .aggregate([
        // Match user by email
        { $match: { _id: new ObjectId(id) } },
        // Lookup roles
        {
          $lookup: {
            from: 'roles',
            localField: 'roleIds',
            foreignField: '_id',
            as: 'roles',
          },
        },
        // Unwind roles to process each separately
        { $unwind: '$roles' },

        // Lookup features of the current role
        {
          $lookup: {
            from: 'features',
            localField: 'roles.featureIds',
            foreignField: '_id',
            as: 'roleFeatures',
          },
        },

        // Lookup permissions for this role's features
        {
          $lookup: {
            from: 'user_feature_permissions',
            localField: 'roleId',
            foreignField: 'roles._id',
            as: 'rolePermissions',
          },
        },

        // Embed permission info inside each feature
        {
          $addFields: {
            'roles.features': {
              $map: {
                input: '$roleFeatures',
                as: 'feature',
                in: {
                  id: '$$feature._id',
                  name: '$$feature.name',
                  uniqueId: '$$feature.uniqueId',
                  permission: {
                    $let: {
                      vars: {
                        perm: {
                          $first: {
                            $filter: {
                              input: '$rolePermissions',
                              as: 'p',
                              cond: {
                                $and: [
                                  {
                                    $eq: [
                                      { $toString: '$$p.featureId' },
                                      { $toString: '$$feature._id' },
                                    ],
                                  },
                                  {
                                    $eq: [
                                      { $toString: '$$p.roleId' },
                                      { $toString: '$roles._id' },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                      },
                      in: {
                        read: { $ifNull: ['$$perm.read', false] },
                        write: { $ifNull: ['$$perm.write', false] },
                        admin: { $ifNull: ['$$perm.admin', false] },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // Group back by user to merge all role-feature-permissions into one user object
        {
          $group: {
            _id: '$_id',
            id: { $first: '$_id' },
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            email: { $first: '$email' },
            password: { $first: '$password' },
            organizationName: { $first: '$organizationName' },
            profileImage: { $first: '$profileImage' },
            isEmailVerified: { $first: '$isEmailVerified' },
            isActive: { $first: '$isActive' },
            enterpriseId: { $first: '$enterpriseId' },
            gender: { $first: '$gender' },
            birthday: { $first: '$birthday' },
            isEnterpriseAdmin: { $first: '$isEnterpriseAdmin' },
            address: { $first: '$address' },
            city: { $first: '$city' },
            state: { $first: '$state' },
            pincode: { $first: '$pincode' },
            countryCode: { $first: '$countryCode' },
            phoneNumber: { $first: '$phoneNumber' },
            roles: {
              $push: {
                id: '$roles._id',
                name: '$roles.name',
                features: '$roles.features',
              },
            },
          },
        },
      ])
      .toArray();

    if (users.length === 0) {
      return [];
    }
    return users[0];
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ _id: new ObjectId(id) });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async setUsersActiveByEnterpriseId(enterpriseId: string, isActive: boolean) {
    return this.userRepository.updateMany(
      { enterpriseId: enterpriseId },
      { $set: { isActive } },
    );
  }

  async create(dto: UpdateUserDto): Promise<User> {
    // Check for existing email
    const existingByEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingByEmail) {
      throw new BadRequestException('Email is already in use');
    }

    // Check for existing phone number
    if (dto.phoneNumber) {
      const existingByPhone = await this.userRepository.findOne({
        where: { phoneNumber: dto.phoneNumber, countryCode: dto.countryCode },
      });
      if (existingByPhone) {
        throw new BadRequestException('Phone number is already in use');
      }
    }
    const user = this.userRepository.create(dto);
    if (dto.roleIds?.length) {
      const objectIdRoleIds = dto.roleIds.map((id) => new ObjectId(id));
      const roles = await this.roleService.findByIds(objectIdRoleIds);

      if (roles.length !== dto.roleIds.length) {
        const foundIds = roles.map((r) => r.id.toString());
        const missing = dto.roleIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Invalid role IDs: ${missing.join(', ')}`,
        );
      }
      user.roleIds = roles.map((r) => r.id);
    }
    return this.userRepository.save(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async updateProfileImageBase64(userId: string, profileImage: string) {
    try {
      console.log('🖼️ Updating profile image for user:', userId);
      
      if (!profileImage) {
        throw new BadRequestException('Profile image is required');
      }
      
      // Extract base64 data
      const matches = profileImage?.match(
        /^data:image\/(png|jpeg|jpg);base64,(.+)$/,
      );
      if (!matches) throw new BadRequestException('Invalid image format');

      const ext = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const mimetype = `image/${ext}`;
      const fileName = `${uuidv4()}.${ext}`;
      let imageUrl: any = '';
      
      console.log('📁 Processing image:', { ext, mimetype, fileName, size: buffer.length });
      
      if (process.env.NODE_ENV === 'local') {
        console.log('🏠 Using Supabase for local development');
        const { path, publicUrl } = await this.supabaseService.upload({
          filePath: 'profile_' + fileName,
          file: buffer,
          contentType: mimetype,
          bucket: 'profiles',
        });
        imageUrl = publicUrl;
        console.log('✅ Supabase upload successful:', { imageUrl, path });
      } else {
        console.log('☁️ Using AWS S3 for production');
        try {
          // For production, upload to S3
          const awsUploadReqDto = {
            Bucket: this.awsConfig.bucketName,
            Key:
              this.awsConfig.bucketFolderName +
              '/' +
              this.awsConfig.bucketTempFolderName +
              '/' +
              fileName,
            Body: buffer,
            ContentType: mimetype,
          };

          const response =
            await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
          imageUrl = response?.Location;
          console.log('✅ AWS S3 upload successful:', imageUrl);
        } catch (s3Error) {
          console.error('❌ AWS S3 upload failed, using Supabase fallback:', s3Error.message);
          // Fallback to Supabase if AWS S3 fails
          try {
            const { path, publicUrl } = await this.supabaseService.upload({
              filePath: 'profile_' + fileName,
              file: buffer,
              contentType: mimetype,
              bucket: 'profiles',
            });
            imageUrl = publicUrl;
            console.log('✅ Supabase fallback upload successful:', imageUrl);
          } catch (supabaseError) {
            console.error('❌ Supabase fallback also failed:', supabaseError.message);
            // Final fallback - return a placeholder URL
            imageUrl = `https://via.placeholder.com/150x150/cccccc/666666?text=Profile+Image`;
            console.log('⚠️ Using placeholder image URL:', imageUrl);
          }
        }
      }
      
      // Update in DB
      console.log('💾 Updating database with image URL:', imageUrl);
      const updateResult = await this.userRepository.update(
        { _id: new ObjectId(userId) } as any,
        { profileImage: imageUrl }
      );
      
      console.log('✅ Database update result:', updateResult);
      return { profileImage: imageUrl };
      
    } catch (error) {
      console.error('❌ Error updating profile image:', error);
      throw error;
    }
  }

  async uploadFilesToS3Bucket(file: any): Promise<string> {
    try {
      console.log('Upload method called, NODE_ENV:', process.env.NODE_ENV);
      
      if (process.env.NODE_ENV === 'local') {
        // For local development, use Supabase
        console.log('Using Supabase for local upload');
        
        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = path.extname(file.originalname);
        const fileName = `profile_${timestamp}_${randomSuffix}${fileExtension}`;

        const uploadResult = await this.supabaseService.upload({
          filePath: fileName,
          file: file.buffer,
          contentType: file.mimetype,
          bucket: 'profiles',
        });
        console.log('Supabase upload result:', uploadResult);
        return uploadResult.publicUrl || '';
      } else {
        // For production, use AWS S3
        console.log('Using AWS S3 for production upload');
        
        const awsUploadReqDto = {
          Bucket: this.awsConfig.bucketName,
          Key:
            this.awsConfig.bucketFolderName +
            '/' +
            this.awsConfig.bucketTempFolderName +
            '/' +
            file.originalname,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
        console.log('AWS S3 upload result:', response);
        return response?.Location || '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback to Supabase if AWS fails
      try {
        console.log('Falling back to Supabase upload');
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = path.extname(file.originalname);
        const fileName = `profile_${timestamp}_${randomSuffix}${fileExtension}`;

        const uploadResult = await this.supabaseService.upload({
          filePath: fileName,
          file: file.buffer,
          contentType: file.mimetype,
          bucket: 'profiles',
        });
        console.log('Supabase fallback upload result:', uploadResult);
        return uploadResult.publicUrl || '';
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        throw new Error('File upload failed: ' + fallbackError.message);
      }
    }
  }

  async forgotPasswordMobile(email: string) {
    this.sendOtp(email);
  }
  async resetPasswordMobile(dto: ResetPasswordMobileDto) {
    const { email, newPassword } = dto;

    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user) throw new NotFoundException('User not found');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    // 4. send confirmation email
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully.',
    });
    return { message: 'Password reset successful' };
  }

  async saveEnterpriseUser(dto: CreateEnterpriseUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    if (dto.roleIds?.length) {
      const objectIdRoleIds = dto.roleIds.map((id) => new ObjectId(id));
      const roles = await this.roleService.findByIds(objectIdRoleIds);
      if (roles.length !== dto.roleIds.length) {
        const foundIds = roles.map((r) => r.id.toString());
        const missing = dto.roleIds.filter(
          (id) => !foundIds.includes(id.toString()),
        );
        throw new BadRequestException(
          `Invalid role IDs: ${missing.join(', ')}`,
        );
      }
      user.roleIds = roles.map((r) => r.id);
    }
    return this.userRepository.save(user);
  }

  async findByToken(token: string): Promise<User | null> {
    console.log(token);
    return this.userRepository.findOne({ where: { token: token } });
  }

  async resetEnterprisePassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    await this.userRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: await bcrypt.hash(newPassword, 10) } },
    );
  }

  updateEnterpriseUser(id: string, userData: Partial<UpdateUserDto>) {
    return this.userRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: userData },
    );
  }
  findByEnterpriseId(enterpriseId: string) {
    return this.userRepository.findOne({
      where: { enterpriseId:enterpriseId},
    }); 
  }
}
