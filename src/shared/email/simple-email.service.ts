import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SimpleEmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendSimpleEmail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log(`📧 Simple Email Service - Sending to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 Content: ${text}`);
      
      // For now, just log the email content
      // In a real implementation, you could use a different email service
      // like AWS SES, Mailgun, or even a webhook to an external service
      
      console.log('✅ Simple email logged successfully (no actual sending)');
      return true;
    } catch (error) {
      console.error('❌ Simple email service failed:', error);
      return false;
    }
  }
}
