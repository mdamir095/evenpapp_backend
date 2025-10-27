import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ISendGridEmailOptions } from './interface/email.service.interface';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@core/logger/logger.service';

@Injectable()
export class EmailService {
  private baseUrlConfig;
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService
  ) {
    this.baseUrlConfig = this.configService.get('baseUrl');
  }

  async sendEmail(options: ISendGridEmailOptions): Promise<void> {
    // Destructure options
    const { to, subject, text, html, template, context, from } = options;
    // Send email using the MailerService (or SendGrid API)
    await this.mailerService.sendMail({
      to,
      from: from ?? this.configService.get("email.supportEmail"),
      subject,
      text,
      html,
      template: template || '',
      context: context || {},
    });

  }

  async prepareEmailContent<T>(emailData: T, option:{type: string, subject: string}) {
    let objModel={
      ...emailData,
      pdfView: 0,
      imgBaseUrl : this.baseUrlConfig.headerImageUrl,
      linkedInLink:this.baseUrlConfig.linkedInLink + "/company/swire-shipping",
      contactUsLink : this.baseUrlConfig.cmsBaseUrl + "/offices/",
      goToDashboardLink :this.baseUrlConfig.headerImageUrl + "/dashboard/booking",
      faqLink : this.baseUrlConfig.headerImageUrl + "/faq",
      bookShipment: this.baseUrlConfig.headerImageUrl + "/requestSailing",
      requestQuote : this.baseUrlConfig.headerImageUrl + "/requestSailing"
    }
    return objModel;
  }
}
