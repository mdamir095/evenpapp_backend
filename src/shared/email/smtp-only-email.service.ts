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

      // Create transporter with Railway-optimized settings
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 45000, // 45 seconds for Railway
        greetingTimeout: 45000,
        socketTimeout: 45000,
        tls: { 
          rejectUnauthorized: false, // Allow self-signed certificates
          ciphers: 'SSLv3' // Use older cipher for compatibility
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 1,
        rateLimit: 1, // Send 1 email per second max
      });

      // Verify connection
      console.log('📧 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified');

      // Send email
      const mailOptions = {
        from: `"No Reply" <${smtpFrom}>`,
        to: to,
        subject: subject,
        text: text,
      };

      console.log('📧 Sending email via Gmail SMTP...');
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Gmail SMTP:', info.messageId);
      
      // Close the connection
      transporter.close();
      
      return true;
      
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
