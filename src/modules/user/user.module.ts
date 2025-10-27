import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RoleModule } from '@modules/role/role.module'
import { FeatureModule } from '@modules/feature/feature.module';
import { AwsModule } from '@core/aws/aws.module';
import { UserFeaturePermissionModule } from '@modules/user-feature-permission/user-feature-permission.module';
import { FormModule } from '@modules/form/form.module';
@Module({
    controllers: [UserController],
    providers: [
        UserService
    ],
    exports: [
        UserService
        
    ],
    imports: [
        TypeOrmModule.forFeature([User], 'mongo'),
        RoleModule,
        FeatureModule,
        AwsModule,
        UserFeaturePermissionModule,
        FormModule
    ],
})
export class UserModule { }
