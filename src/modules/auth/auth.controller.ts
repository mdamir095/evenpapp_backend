import { Body, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '@modules/user/user.service';
import { LoggerService } from '@core/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '@modules/user/entities/user.entity';
import { SendOtpDto } from './dto/request/send-otp.req.dto';
import { VerifyOtpDto } from './dto/request/verify-otp.req.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.req.dto';
import { ResetPasswordDto } from './dto/request/reset-password.req.dto';
import { LoginReqDto } from './dto/request/login.req.dto';
import { SignUpReqDto } from './dto/request/sign-up.req.dto';
import { GoogleLoginDto } from './dto/request/google-login.req.dto';
import { PhoneLoginDto } from './dto/request/phone-login.req.dto';
import { VerifyPhoneOtpDto } from './dto/request/phone-verify-otp.req.dto';
import { SendPhoneOtpDto } from './dto/request/send-phone-otp.req.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@common/decorators/permission.decorator';
import { RoleType } from '@shared/enums/roleType';
import { ResetPasswordMobileDto } from './dto/request/reset-password-mobile.req.dto';


@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    private authConfig;
    private jwtConfig;
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.jwtConfig = this.configService.get('jwt');
        this.authConfig = this.configService.get('auth');
    }

    @Post('sign-up')
    @HttpCode(200)
    @ApiBody({ type: SignUpReqDto })
    @ApiResponse({ status: 200, description: 'Signup successful' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    public async signUp(@Body() payload: SignUpReqDto) {
        try {
            return await this.authService.signUp(payload);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }
    
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    @ApiBody({ type: LoginReqDto })
    @ApiResponse({ status: 200, description: 'Login successful' })
    public async login(@Req() req: any, @Body() body: LoginReqDto) {
        console.log('Login endpoint called with:', body.email);
        const user = req.user as User;
        console.log('User from guard:', user ? 'Found' : 'Not found');
        const result = await this.authService.signinJwt(user);
        console.log('JWT generated successfully');
        return result;
    }

    @Post('register')
    @HttpCode(200)
    @ApiBody({ type: SignUpReqDto })
    @ApiResponse({ status: 200, description: 'Registration successful' })
    public async register(@Body() payload: SignUpReqDto) {
        return await this.authService.signUp(payload);
    }
   
    @Post('send-otp')
    @HttpCode(200)
    @ApiBody({ type: SendOtpDto })
    @ApiResponse({ status: 200, description: 'OTP sent' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async sendOtp(@Body() dto: SendOtpDto) {
      try {
        return await this.userService.sendOtp(dto.email);
      } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
      }
    }
  
    @Post('verify-otp')
    @HttpCode(200)
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, description: 'Email verified' })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
      return this.authService.verifyOtp(dto.email, dto.otp);
    }

    
    @Post('forgot-password')
    @HttpCode(200)
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
    }

    @Post('reset-password')
    @HttpCode(200)
    @ApiBody({ type: ResetPasswordMobileDto })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    async resetPassword(@Body() dto: ResetPasswordMobileDto) {
    return this.authService.resetPassword(dto);
    }

    @Post('login/google')
    @HttpCode(200)
    @ApiBody({ type: GoogleLoginDto })
    @ApiResponse({ status: 200, description: 'Google login successful' })
    async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.token);
    }
    
    @Post('send-otp/phone')
    @HttpCode(200)
    @ApiBody({ type: SendPhoneOtpDto })
    @ApiResponse({ status: 200, description: 'OTP sent to phone' })
    async sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
      return this.authService.sendPhoneOtp(dto);
    }
    @Post('verify-otp/phone')
    @HttpCode(200)
    @ApiBody({ type: VerifyPhoneOtpDto })
    @ApiResponse({ status: 200, description: 'Phone OTP verified' })
    async verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
     return this.authService.verifyPhoneOtp(dto);
    }
}
