import { Module } from '@nestjs/common'; 
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';  
import { UserModule } from '@modules/user/user.module';
import { RoleModule } from '@modules/role/role.module';
import { Feature } from '@modules/feature/entities/feature.entity';
import { FeatureModule } from '@modules/feature/feature.module';
@Module({
    controllers: [AuthController],
    providers: [
        AuthService, 
        LocalStrategy,
        JwtStrategy 
    ],
    // Import UserModule for user-related dependencies (do not import AuthModule into itself)
    imports: [
        ConfigModule,
        UserModule,
        RoleModule, 
        FeatureModule
    ],
    exports: [AuthService]
})
export class AuthModule { }
