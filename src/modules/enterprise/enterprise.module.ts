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
import { RobustEmailService } from '@shared/email/robust-email.service';
import { HttpEmailService } from '@shared/email/http-email.service';
import { WebhookEmailService } from '@shared/email/webhook-email.service';
import { SimpleEmailService } from '@shared/email/simple-email.service';
import { SmtpOnlyEmailService } from '@shared/email/smtp-only-email.service';
import { RailwayEmailService } from '@shared/email/railway-email.service';
import { RailwayDirectEmailService } from '@shared/email/railway-direct-email.service';
import { ResendEmailService } from '@shared/email/resend-email.service';


@Module({
    imports: [TypeOrmModule.forFeature([Enterprise],'mongo'),
   UserModule,
   MailerModule,
   RoleModule,
   FeatureModule,
   UserFeaturePermissionModule
   
],
    controllers: [EnterpriseController],
    providers: [
        EnterpriseService,
        RobustEmailService,
        HttpEmailService,
        WebhookEmailService,
        SimpleEmailService,
        SmtpOnlyEmailService,
        RailwayEmailService,
        RailwayDirectEmailService,
        ResendEmailService
    ],
    exports: [EnterpriseService],
})
export class EnterpriseModule {}
