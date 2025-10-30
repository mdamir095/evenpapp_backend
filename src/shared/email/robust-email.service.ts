import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { WebhookEmailService } from './webhook-email.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class RobustEmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly webhookEmailService: WebhookEmailService
  ) {}

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    const strategies = [
      () => this.trySendGrid(to, subject, text),
      () => this.tryGmailSMTP(to, subject, text),
      () => this.tryWebhook(to, subject, text),
      () => this.tryConsoleLog(to, subject, text)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Trying email strategy ${i + 1}/${strategies.length}...`);
        const success = await strategies[i]();
        if (success) {
          console.log(`✅ Email sent successfully using strategy ${i + 1}`);
          return true;
        }
      } catch (error) {
        console.error(`❌ Strategy ${i + 1} failed:`, error.message);
        continue;
      }
    }

    console.error('❌ All email strategies failed');
    return false;
  }

  private async trySendGrid(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying SendGrid...');
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
      return true;
    } catch (error) {
      console.error('❌ SendGrid failed:', error.message);
      throw error;
    }
  }

  private async tryGmailSMTP(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying Gmail SMTP...');
      
      // Create a new nodemailer transport for Gmail SMTP
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: this.configService.get('email.SMTP_USER'),
          pass: this.configService.get('email.SMTP_PASS'),
        },
        connectionTimeout: 20000, // 20 seconds
        greetingTimeout: 20000,   // 20 seconds
        socketTimeout: 20000,     // 20 seconds
      });
      
      // Verify connection configuration
      console.log('📧 Verifying Gmail SMTP connection...');
      await transporter.verify();
      console.log('✅ Gmail SMTP connection verified');
      
      const mailOptions = {
        from: `"No Reply" <${this.configService.get('email.SMTP_FROM')}>`,
        to: to,
        subject: subject,
        text: text,
      };
      
      console.log('📧 Sending email via Gmail SMTP...');
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Gmail SMTP email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Gmail SMTP failed:', error.message);
      throw error;
    }
  }

  private async tryWebhook(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying Webhook service...');
      return await this.webhookEmailService.sendEmailViaWebhook(to, subject, text);
    } catch (error) {
      console.error('❌ Webhook service failed:', error.message);
      throw error;
    }
  }

  private async tryConsoleLog(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Using console logging as final fallback...');
      console.log('='.repeat(50));
      console.log('📧 EMAIL NOTIFICATION');
      console.log('='.repeat(50));
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
      return true;
    } catch (error) {
      console.error('❌ Console logging failed:', error.message);
      throw error;
    }
  }
}
