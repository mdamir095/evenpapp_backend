import { ExtractJwt, Strategy } from 'passport-jwt';;
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@modules/user/user.service';

export interface IJwtConfig {
    cookieKeyName: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    static authConfig: IJwtConfig;

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get("jwt.secret")
        });
        JwtStrategy.authConfig = this.configService.get("auth") as IJwtConfig;
    }

    async validate(payload: any) {
        return await this.userService.verify(payload)
            .then(user => _callback_jwt(false, user))
            .catch(err => _callback_jwt(err, false))
    }

}

export const _callback_jwt = (err: any, user:any|boolean, info: any = undefined) => {
    let message
    if (err) {
        return (err || new UnauthorizedException(info.message));
    } else if (typeof info != 'undefined' || !user) {
        switch (info.message) {
            case 'No auth token':
            case 'invalid signature':
            case 'jwt malformed':
            case 'invalid token':
            case 'invalid signature':
                message = "You must provide a valid authenticated access token"
                break
            case 'jwt expired':
                message = "Your session has expired"
                break
            default:
                message = info.message;
                break
        }
        throw new UnauthorizedException(message);
    }
    if(user && typeof(user)!="boolean"){
        const { id,firstName,lastName,email,organizationName, enterpriseId} = user;
        const roles = user.roles || [];
        return { id,firstName,lastName,email,organizationName,roles, enterpriseId };
    }

    return null
}