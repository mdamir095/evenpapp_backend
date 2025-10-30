import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpOnlyEmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 SMTP-Only Email Service - Sending email...');
      
      // Get SMTP credentials from environment variables or config
      const smtpUser = process.env.SMTP_USER || this.configService.get('email.SMTP_USER');
      const smtpPass = process.env.SMTP_PASS || this.configService.get('email.SMTP_PASS');
      const smtpFrom = process.env.SMTP_FROM || this.configService.get('email.SMTP_FROM');
      
      console.log('📧 SMTP Config:', {
        user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT_SET',
        from: smtpFrom ? `${smtpFrom.substring(0, 3)}***` : 'NOT_SET',
        passLength: smtpPass ? smtpPass.length : 0,
        source: process.env.SMTP_USER ? 'ENV_VAR' : 'CONFIG_FILE'
      });
      
      if (!smtpUser || !smtpPass || !smtpFrom) {
        throw new Error('SMTP credentials not configured');
      }

      // Try multiple SMTP configurations for Railway
      const configs = [
        {
          name: 'Gmail TLS (Port 587) - Railway Optimized',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 60000,
          greetingTimeout: 60000,
          socketTimeout: 60000,
          tls: { 
            rejectUnauthorized: false,
            ciphers: 'SSLv3',
            servername: 'smtp.gmail.com'
          },
          pool: false,
          ignoreTLS: false,
          requireTLS: true,
        },
        {
          name: 'Gmail SSL (Port 465) - Railway Optimized',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 60000,
          greetingTimeout: 60000,
          socketTimeout: 60000,
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
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
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
          
          // Quick connection test
          console.log('📧 Testing connection...');
          await transporter.verify();
          console.log(`✅ ${config.name} connection verified`);
          
          // Send email
          const mailOptions = {
            from: `"No Reply" <${smtpFrom}>`,
            to: to,
            subject: subject,
            text: text,
          };

          console.log('📧 Sending email...');
          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent successfully via ${config.name}:`, info.messageId);
          
          // Close the connection
          transporter.close();
          
          return true;
          
        } catch (configError) {
          console.log(`❌ ${config.name} failed:`, configError.message);
          // Continue to next configuration
        }
      }
      
      throw new Error('All SMTP configurations failed');
      
    } catch (error) {
      console.error('❌ SMTP-Only Email Service failed:', error.message);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      // Log the email content for manual access
      console.log('='.repeat(60));
      console.log('📧 EMAIL CONTENT (SMTP FAILED)');
      console.log('='.repeat(60));
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
      
      return false;
    }
  }
}
