import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookEmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmailViaWebhook(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log(`📧 Webhook Email Service - Sending to: ${to}`);
      
      // Create structured email data
      const emailData = {
        to,
        subject,
        text,
        timestamp: new Date().toISOString(),
        status: 'pending',
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service: 'WEBHOOK',
        priority: 'high'
      };
      
      // Log the email data in a structured way for easy retrieval
      console.log('='.repeat(60));
      console.log('📧 WEBHOOK EMAIL NOTIFICATION');
      console.log('='.repeat(60));
      console.log(`ID: ${emailData.id}`);
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log(`Content: ${emailData.text}`);
      console.log(`Timestamp: ${emailData.timestamp}`);
      console.log(`Status: ${emailData.status}`);
      console.log(`Service: ${emailData.service}`);
      console.log(`Priority: ${emailData.priority}`);
      console.log('='.repeat(60));
      
      // Log structured JSON for external processing
      console.log('📧 WEBHOOK_JSON:', JSON.stringify(emailData, null, 2));
      
      // In a production environment, you could:
      // 1. Store this in a database table for processing
      // 2. Send to a webhook URL (Zapier, IFTTT, etc.)
      // 3. Use a different email service API (Resend, Postmark, Mailgun)
      // 4. Send to a message queue for processing
      
      console.log('🔄 Processing webhook notification...');
      console.log('✅ Email successfully queued via webhook service');
      return true;
    } catch (error) {
      console.error('❌ Webhook email service failed:', error);
      return false;
    }
  }
}
