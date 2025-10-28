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
    const loginDto = plainToInstance(LoginReqDto, req.body);
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((err: any) => Object.values(err.constraints)).flat()
      );
    }
    const user = await this.userService.validateLogin(loginDto);
    return user;
  }
}