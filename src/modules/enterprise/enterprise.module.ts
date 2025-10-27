import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { Enterprise } from './entity/enterprise.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RoleModule } from '@modules/role/role.module';
import { UserFeaturePermissionModule } from '@modules/user-feature-permission/user-feature-permission.module';
import { FeatureModule } from '@modules/feature/feature.module';


@Module({
    imports: [TypeOrmModule.forFeature([Enterprise],'mongo'),
   UserModule,
   MailerModule,
   RoleModule,
   FeatureModule,
   UserFeaturePermissionModule
   
],
    controllers: [EnterpriseController],
    providers: [EnterpriseService],
    exports: [EnterpriseService],
})
export class EnterpriseModule {}
