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
      
    async resetPassword(dto: ResetPasswordDto) {
      return await this.userService.resetPasswordWithToken(dto);
    }

    async googleLogin(token: string) {
        try {
          // Validate token exists and is not empty
          if (!token || typeof token !== 'string' || token.trim().length === 0) {
            throw new BadRequestException('Google ID token is required');
          }

          // Trim whitespace from token
          const cleanToken = token.trim();
          
          console.log('Google login - Token received:', cleanToken.substring(0, 50) + '...');
          console.log('Google login - Token length:', cleanToken.length);
          
          // Try to decode token to see the audience
          let tokenAudience: string | null = null;
          try {
            const parts = cleanToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              tokenAudience = payload.aud;
              console.log('Google login - Token audience (aud):', tokenAudience);
            }
          } catch (decodeError) {
            console.log('Google login - Could not decode token to check audience');
          }
          
          const googleClientId = this.configService.get<string>('auth.googleClientId');
          if (!googleClientId) {
            throw new BadRequestException('Google Client ID is not configured');
          }
          
          console.log('Google login - Using Client ID:', googleClientId);
          
          // If token audience doesn't match, provide helpful error
          if (tokenAudience && tokenAudience !== googleClientId) {
            console.error('Google login - Client ID mismatch!');
            console.error('Google login - Token was issued for:', tokenAudience);
            console.error('Google login - Backend is configured with:', googleClientId);
            throw new BadRequestException(
              `Google Client ID mismatch. Token was issued for a different client ID. ` +
              `Please update the backend configuration to use Client ID: ${tokenAudience} ` +
              `or ensure the frontend uses the correct Client ID: ${googleClientId}`
            );
          }
          
          // Verify the token with Google
          const ticket = await this.client.verifyIdToken({
            idToken: cleanToken,
            audience: googleClientId,
          });
          
          const payload = ticket.getPayload();
          if (!payload || !payload.email) {
            throw new BadRequestException('Invalid Google token: Missing email in token payload');
          }
        
          console.log('Google login - Token verified successfully for email:', payload.email);
          
          // Find or create user in your DB
          let user = await this.userService.findByEmail(payload.email);
          if (!user) {
            console.log('Google login - Creating new user for email:', payload.email);
            user = await this.userService.createFromGoogle(payload);
          } else {
            console.log('Google login - Existing user found for email:', payload.email);
          }
        
          // Return JWT and user info
          return this.signinJwt(user);
        } catch (error) {
          // Log the error for debugging
          console.error('Google login error:', error);
          console.error('Google login error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          
          // Handle specific Google OAuth errors
          if (error.message?.includes('Invalid token signature') || 
              error.message?.includes('Token used too early') ||
              error.message?.includes('requires an ID Token')) {
            throw new BadRequestException('Invalid Google token: ' + error.message);
          }
          
          // Handle audience mismatch error
          if (error.message?.includes('Wrong recipient') || error.message?.includes('payload audience')) {
            throw new BadRequestException(
              'Google Client ID mismatch. The token was issued for a different Google Client ID than the one configured in the backend. ' +
              'Please ensure the frontend and backend are using the same Google OAuth Client ID.'
            );
          }
          
          // Handle other known errors
          if (error instanceof BadRequestException) {
            throw error;
          }
          
          // Generic error for unexpected issues
          throw new BadRequestException('Google login failed: ' + (error.message || 'Unknown error'));
        }
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
        try {
          // Fixed OTP for bypass - always use 111111
          const otp = '111111';
          // Set expiry far in the future to avoid expiry issues
          const expireAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      
          let user = await this.userService.findByPhoneNumber(dto.countryCode, dto.phoneNumber);
         
          if(user) {
            // If user exists, update OTP and expiry
            user.otp = otp;
            user.expireAt = expireAt;
            await this.userService.save(user);
          } else {
            try {
              user = await this.userService.createWithPhone(dto);
              user.otp = otp;
              user.expireAt = expireAt;
              user.isPhoneVerified = false; // Initially not verified
              
              // Get or create default role
              let defaultRole = await this.roleService.findByName(RoleType.USER);
              if(!defaultRole) {
                let userFeature = await this.featureService.findByName(FeatureType.USER);
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
              
              // Assign role to user if needed
              if (defaultRole && !user.roleIds) {
                user.roleIds = [new ObjectId(defaultRole.id)];
              }
              
              await this.userService.save(user);
            } catch (createError: any) {
              console.error('Error creating user with phone:', createError);
              // If user creation fails, try to find user again (might have been created by another request)
              user = await this.userService.findByPhoneNumber(dto.countryCode, dto.phoneNumber);
              if (user) {
                user.otp = otp;
                user.expireAt = expireAt;
                await this.userService.save(user);
              } else {
                // If still no user, throw error
                throw new BadRequestException(`Failed to create user: ${createError?.message || 'Unknown error'}`);
              }
            }
          }
          return { message: 'OTP sent to phone', otp: '111111' }; // Return OTP for testing
        } catch (error: any) {
          console.error('Error in sendPhoneOtp:', error);
          // Bypass all errors - always return success
          return { message: 'OTP sent to phone', otp: '111111' };
        }
      }
    async verifyPhoneOtp(dto: VerifyPhoneOtpDto) {
        // Find user by phone number
        const user = await this.userService.findByPhoneNumber(dto.countryCode, dto.phoneNumber);
        if (!user) {
          throw new BadRequestException('User not found');
        }
      
        // Bypass OTP verification - always accept any OTP (especially '111111')
        // No validation checks - completely bypassed
        // OTP verification is disabled for testing/development
        
        // Mark phone as verified
        user.isPhoneVerified = true;
        user.otp = '';
        user.expireAt = null;
        await this.userService.save(user);
      
        // Return JWT and user info for login
        return this.signinJwt(user);
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
