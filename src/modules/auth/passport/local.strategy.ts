import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate as val, validate } from 'class-validator';
import { LoginReqDto } from '../dto/request/login.req.dto';
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {

    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    });
  }

  async validate(req: any): Promise<User> {
    console.log('🚀 Local strategy validate called');
    console.log('📦 Request body:', req.body);
    
    const loginDto = plainToInstance(LoginReqDto, req.body);
    console.log('📝 Login DTO:', loginDto);
    
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      throw new BadRequestException(
        errors.map((err: any) => Object.values(err.constraints)).flat()
      );
    }
    
    console.log('✅ Validation passed, calling userService.validateLogin');
    const user = await this.userService.validateLogin(loginDto);
    console.log('👤 User returned from validateLogin:', !!user);
    return user;
  }
}