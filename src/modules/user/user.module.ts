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
import { SimpleEmailService } from '@shared/email/simple-email.service';
import { RobustEmailService } from '@shared/email/robust-email.service';
import { WebhookEmailService } from '@shared/email/webhook-email.service';
import { HttpEmailService } from '@shared/email/http-email.service';
import { SmtpOnlyEmailService } from '@shared/email/smtp-only-email.service';
import { RailwayEmailService } from '@shared/email/railway-email.service';
import { RailwayDirectEmailService } from '@shared/email/railway-direct-email.service';
import { ResendEmailService } from '@shared/email/resend-email.service';
@Module({
    controllers: [UserController],
    providers: [
        UserService,
        SimpleEmailService,
        RobustEmailService,
        WebhookEmailService,
        HttpEmailService,
        SmtpOnlyEmailService,
        RailwayEmailService,
        RailwayDirectEmailService,
        ResendEmailService
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
