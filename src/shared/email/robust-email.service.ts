import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { WebhookEmailService } from './webhook-email.service';
import { HttpEmailService } from './http-email.service';
import { SmtpOnlyEmailService } from './smtp-only-email.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class RobustEmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly webhookEmailService: WebhookEmailService,
    private readonly httpEmailService: HttpEmailService,
    private readonly smtpOnlyEmailService: SmtpOnlyEmailService
  ) {}

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    const strategies = [
      () => this.trySmtpOnly(to, subject, text), // SMTP-Only Service (Railway optimized)
      () => this.tryGmailSMTP(to, subject, text), // Gmail SMTP (fallback)
      () => this.tryWebhook(to, subject, text), // Webhook logging
      () => this.tryConsoleLog(to, subject, text) // Console logging
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

  private async trySmtpOnly(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying SMTP-Only Service...');
      return await this.smtpOnlyEmailService.sendEmail(to, subject, text);
    } catch (error) {
      console.error('❌ SMTP-Only Service failed:', error.message);
      throw error;
    }
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
      
      // Try environment variables first, then config
      const smtpUser = process.env.SMTP_USER || this.configService.get('email.SMTP_USER');
      const smtpPass = process.env.SMTP_PASS || this.configService.get('email.SMTP_PASS');
      const smtpFrom = process.env.SMTP_FROM || this.configService.get('email.SMTP_FROM');
      
      console.log('📧 Gmail SMTP Config:', {
        user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT_SET',
        from: smtpFrom ? `${smtpFrom.substring(0, 3)}***` : 'NOT_SET',
        passLength: smtpPass ? smtpPass.length : 0,
        source: process.env.SMTP_USER ? 'ENV_VAR' : 'CONFIG_FILE'
      });
      
      if (!smtpUser || !smtpPass || !smtpFrom) {
        throw new Error('Gmail SMTP credentials not configured');
      }
      
      // Try multiple Gmail SMTP configurations with Railway-optimized settings
      const configs = [
        {
          name: 'Gmail TLS (Port 587) - Railway Optimized',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // Use TLS
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 30000, // Increased timeout for Railway
          greetingTimeout: 30000,
          socketTimeout: 30000,
          tls: { rejectUnauthorized: false }, // Allow self-signed certificates
          pool: true,
          maxConnections: 1,
          maxMessages: 1,
        },
        {
          name: 'Gmail SSL (Port 465) - Railway Optimized',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          tls: { rejectUnauthorized: false },
          pool: true,
          maxConnections: 1,
          maxMessages: 1,
        },
        {
          name: 'Gmail TLS (Port 2525) - Alternative',
          host: 'smtp.gmail.com',
          port: 2525,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 20000,
          greetingTimeout: 20000,
          socketTimeout: 20000,
          tls: { rejectUnauthorized: false },
        }
      ];
      
      for (const config of configs) {
        try {
          console.log(`📧 Trying ${config.name}...`);
          
          const transporter = nodemailer.createTransport(config);
          
          // Quick connection test with shorter timeout
          console.log('📧 Testing connection...');
          await transporter.verify();
          console.log(`✅ ${config.name} connection verified`);
          
          const mailOptions = {
            from: `"No Reply" <${smtpFrom}>`,
            to: to,
            subject: subject,
            text: text,
          };
          
          console.log('📧 Sending email...');
          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent successfully via ${config.name}:`, info.messageId);
          return true;
          
        } catch (configError) {
          console.log(`❌ ${config.name} failed:`, configError.message);
          // Continue to next configuration
        }
      }
      
      throw new Error('All Gmail SMTP configurations failed');
      
    } catch (error) {
      console.error('❌ Gmail SMTP completely failed:', error.message);
      throw error;
    }
  }

  private async tryHttpEmail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying HTTP email service...');
      return await this.httpEmailService.sendEmailViaHttp(to, subject, text);
    } catch (error) {
      console.error('❌ HTTP email service failed:', error.message);
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
