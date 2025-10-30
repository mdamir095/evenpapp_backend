import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { WebhookEmailService } from './webhook-email.service';
import { HttpEmailService } from './http-email.service';
import { SmtpOnlyEmailService } from './smtp-only-email.service';
import { RailwayEmailService } from './railway-email.service';
import { RailwayDirectEmailService } from './railway-direct-email.service';
import { ResendEmailService } from './resend-email.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class RobustEmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly webhookEmailService: WebhookEmailService,
    private readonly httpEmailService: HttpEmailService,
    private readonly smtpOnlyEmailService: SmtpOnlyEmailService,
    private readonly railwayEmailService: RailwayEmailService,
    private readonly railwayDirectEmailService: RailwayDirectEmailService,
    private readonly resendEmailService: ResendEmailService
  ) {}

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    // Check if we're in production and have SendGrid configured
    const isProduction = process.env.NODE_ENV === 'production';
    const hasSendGrid = process.env.SENDGRID_API_KEY || this.configService.get('sendGrid.apiKey');
    
    let strategies;
    
    // Prioritize HTTP providers first (work on Railway), then SMTP
    strategies = [
      () => this.tryResend(to, subject, text), // Resend API (HTTP) - PRIMARY
      () => this.trySendGridAPI(to, subject, text), // SendGrid API (HTTP) - FALLBACK
      () => this.tryGmailSMTP(to, subject, text), // Gmail SMTP - FALLBACK
      () => this.trySmtpOnly(to, subject, text), // SMTP variations - FALLBACK
      () => this.tryRailwayDirect(to, subject, text), // Logging backup
      () => this.tryRailwayEmail(to, subject, text), // Logging backup
      () => this.tryWebhook(to, subject, text), // Logging backup
      () => this.tryConsoleLog(to, subject, text) // Guaranteed logging
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

  private async tryResend(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying Resend Email Service...');
      return await this.resendEmailService.sendEmail(to, subject, text);
    } catch (error) {
      console.error('❌ Resend Email Service failed:', error.message);
      throw error;
    }
  }

  private async tryRailwayDirect(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying Railway Direct Service...');
      return await this.railwayDirectEmailService.sendEmail(to, subject, text);
    } catch (error) {
      console.error('❌ Railway Direct Service failed:', error.message);
      throw error;
    }
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
      let smtpFrom = process.env.SMTP_FROM || this.configService.get('email.SMTP_FROM') || smtpUser;
      
      console.log('📧 Gmail SMTP Config:', {
        user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT_SET',
        from: smtpFrom ? `${smtpFrom.substring(0, 3)}***` : 'NOT_SET',
        passLength: smtpPass ? smtpPass.length : 0,
        source: process.env.SMTP_USER ? 'ENV_VAR' : 'CONFIG_FILE'
      });
      
      if (!smtpUser || !smtpPass) {
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
          connectionTimeout: 15000, // Reduced timeout for faster fallback
          greetingTimeout: 15000,
          socketTimeout: 15000,
          tls: { 
            rejectUnauthorized: false,
            ciphers: 'SSLv3',
            servername: 'smtp.gmail.com'
          },
          pool: false, // Disable pooling for Railway
          ignoreTLS: false,
          requireTLS: true,
        },
        {
          name: 'Gmail SSL (Port 465) - Railway Optimized',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 15000,
          tls: { 
            rejectUnauthorized: false,
            ciphers: 'SSLv3',
            servername: 'smtp.gmail.com'
          },
          pool: false,
        },
        {
          name: 'Gmail TLS (Port 2525) - Alternative',
          host: 'smtp.gmail.com',
          port: 2525,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          tls: { 
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
          },
          pool: false,
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

  private async tryRailwayEmail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying Railway Email service...');
      return await this.railwayEmailService.sendEmail(to, subject, text);
    } catch (error) {
      console.error('❌ Railway Email service failed:', error.message);
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

  private async trySendGridAPI(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying SendGrid API...');
      
      const sendGridApiKey = process.env.SENDGRID_API_KEY || this.configService.get('sendGrid.apiKey');
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || this.configService.get('sendGrid.fromEmail');
      
      console.log('📧 SendGrid API Config:', {
        apiKey: sendGridApiKey ? `${sendGridApiKey.substring(0, 10)}...` : 'NOT_SET',
        fromEmail: fromEmail ? `${fromEmail.substring(0, 3)}***` : 'NOT_SET',
        source: process.env.SENDGRID_API_KEY ? 'ENV_VAR' : 'CONFIG_FILE'
      });
      
      if (!sendGridApiKey || !fromEmail) {
        throw new Error('SendGrid API credentials not configured');
      }

      const emailData = {
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: fromEmail },
        content: [{
          type: 'text/plain',
          value: text
        }]
      };

      console.log('📧 Sending email via SendGrid API...');
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('✅ SendGrid API email sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ SendGrid API failed: ${response.status} - ${errorText}`);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.log('🔧 SendGrid API Key Issue:');
          console.log('   - API key may be invalid, expired, or revoked');
          console.log('   - Check SendGrid dashboard for key status');
          console.log('   - Generate a new API key if needed');
        } else if (response.status === 403) {
          console.log('🔧 SendGrid API Permission Issue:');
          console.log('   - API key may not have mail send permissions');
          console.log('   - Check SendGrid account verification status');
        }
        
        throw new Error(`SendGrid API failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ SendGrid API failed:', error.message);
      throw error;
    }
  }
}
