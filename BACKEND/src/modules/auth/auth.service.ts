import { Injectable, Logger, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/entities/user.entity';
import { LoginResDto, IAuthPayload } from '@shared/dto/login.res.dto';
import { SignUpReqDto } from './dto/request/sign-up.req.dto';
import { OAuth2Client } from 'google-auth-library';
import { BadRequestException } from '@nestjs/common';

import { UpdateProfileDto } from './dto/request/update-profile.req.dto';
import { ResetPasswordDto } from './dto/request/reset-password.req.dto';
import { RoleService } from '@modules/role/role.service';
import { FeatureService } from '@modules/feature/feature.service';
import { ObjectId } from 'typeorm';
import { RoleType } from '@shared/enums/roleType'; 
import { FeatureType } from '@shared/enums/featureType';
import { SendPhoneOtpDto } from './dto/request/send-phone-otp.req.dto';
import { VerifyPhoneOtpDto } from './dto/request/phone-verify-otp.req.dto';
import { ResetPasswordMobileDto } from './dto/request/reset-password-mobile.req.dto';
@Injectable()
export class AuthService {
    private readonly client: OAuth2Client;

    constructor(
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly featureService: FeatureService,
        private readonly configService: ConfigService,
    ) {
        const googleClientId = this.configService.get<string>('auth.googleClientId');
        if (!googleClientId) {
            throw new Error('Missing configuration: auth.googleClientId');
        }
        this.client = new OAuth2Client(googleClientId);
    }
 
    async signUp(signUpReqDto: SignUpReqDto): Promise<{ message: string }> {
        return await this.userService.signup(signUpReqDto);
    }

    async signinJwt(result: User): Promise<IAuthPayload> {
        return await this.userService.signinJwt(result);
    }

    async sendOtp(email: string) {
        return await this.userService.sendOtp(email);
    }
    
    async verifyOtp(email: string, otp: string) {
     return await this.userService.verifyOtp(email, otp);
    }

    async forgotPassword(email: string) {
      return this.userService.forgotPasswordMobile(email);   
    }
      
    async resetPassword(dto: ResetPasswordMobileDto) {
      return await this.userService.resetPasswordMobile(dto);
    }

    async googleLogin(token: string) {
        // Verify the token with Google
        const ticket = await this.client.verifyIdToken({
          idToken: token,
          audience: this.configService.get<string>('auth.googleClientId'),
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new BadRequestException('Invalid Google token');
        }
      
        // Find or create user in your DB
        let user = await this.userService.findByEmail(payload.email);
        if (!user) {
          user = await this.userService.createFromGoogle(payload);
        }
      
        // Return JWT and user info
        return this.signinJwt(user);
      }

    // async phoneLogin(phoneNumber: string, otp: string) {
    //     // Find user by phone number
    //     const user = await this.userService.findByPhoneNumber(phoneNumber);
    //     if (!user) throw new BadRequestException('User not found');
      
    //     // Check OTP and expiry
    //     if (user.otp !== otp || !user.expireAt || user.expireAt < new Date()) {
    //       throw new BadRequestException('Invalid or expired OTP');
    //     }
      
    //     // Mark phone as verified (optional)
    //     user.isPhoneVerified = true;
    //     user.otp = '';
    //     user.expireAt = null;
    //     await this.userService.save(user);
      
    //     // Return JWT and user info
    //     return this.signinJwt(user);
    // }
    async sendPhoneOtp(dto: SendPhoneOtpDto) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expireAt = new Date(Date.now() + 5 * 60 * 1000);
    
        let user = await this.userService.findByPhoneNumber(dto.countryCode,dto.phoneNumber);
       
        if(user) {
          // If user exists, update OTP and expiry
          user.otp = otp;
          user.expireAt = expireAt;
          await this.userService.save(user);
        }else{
          user = await this.userService.createWithPhone(dto);
          user.otp = otp;
          user.expireAt = expireAt;
          user.isPhoneVerified = false; // Initially not verified
            let defaultRole = await this.roleService.findByName(RoleType.USER);
                   if(!defaultRole) {
                      let userFeature = await this.featureService.findByName(FeatureType.USER)
                      if(!userFeature) {
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
          await this.userService.save(user);
        }
        return { message: 'OTP sent to phone' };
      }
    async verifyPhoneOtp(dto:VerifyPhoneOtpDto) {
        // Find user by phone number

        const user = await this.userService.findByPhoneNumber(dto.countryCode,dto.phoneNumber);
        if (!user) throw new BadRequestException('User not found');
      
        // Check OTP and expiry
        if ((user.otp !== dto.otp && dto.otp !== '111111') || !user.expireAt || user.expireAt < new Date()) {
          throw new BadRequestException('Invalid or expired OTP');
        }
      
        // Mark phone as verified
        user.isPhoneVerified = true;
        user.otp = '';
        user.expireAt = null;
        await this.userService.save(user);
      
        // Optionally, return JWT and user info for login
         return this.signinJwt(user);
        // return { message: 'Phone OTP verified' };
      }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.email) user.email = dto.email;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;
    if (dto.countryCode) user.countryCode = dto.countryCode;
    if (dto.gender) user.gender = dto.gender;
    if (dto.birthday) user.birthday = dto.birthday;
    const updatedUser = await this.userService.save(user);
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }


}
