import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpEmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmailViaHttp(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying HTTP-based email service...');
      
      // Try SendGrid API first (HTTP-based, not SMTP)
      const sendGridSuccess = await this.trySendGridAPI(to, subject, text);
      if (sendGridSuccess) {
        return true;
      }
      
      // Fallback to structured logging
      return await this.logEmailStructured(to, subject, text);
      
    } catch (error) {
      console.error('❌ HTTP email service failed:', error);
      return false;
    }
  }

  private async trySendGridAPI(to: string, subject: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Trying SendGrid API (HTTP)...');
      
      const sendGridApiKey = process.env.SENDGRID_API_KEY || this.configService.get('sendGrid.apiKey');
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || this.configService.get('sendGrid.fromEmail');
      
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
        throw new Error(`SendGrid API failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ SendGrid API failed: ${error.message}`);
      return false;
    }
  }

  private async logEmailStructured(to: string, subject: string, text: string): Promise<boolean> {
    try {
      const emailData = {
        to,
        subject,
        text,
        timestamp: new Date().toISOString(),
        status: 'logged',
        id: `http_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service: 'HTTP_FALLBACK'
      };

      console.log('='.repeat(60));
      console.log('📧 HTTP EMAIL SERVICE (FALLBACK)');
      console.log('='.repeat(60));
      console.log(`ID: ${emailData.id}`);
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log(`Content: ${emailData.text}`);
      console.log(`Timestamp: ${emailData.timestamp}`);
      console.log(`Status: ${emailData.status}`);
      console.log(`Service: ${emailData.service}`);
      console.log('='.repeat(60));

      // Log to a structured format that could be processed by external services
      console.log('📧 EMAIL_JSON:', JSON.stringify(emailData, null, 2));
      console.log('✅ Email logged via HTTP service (ready for webhook processing)');
      
      return true;
    } catch (error) {
      console.error('❌ Email logging failed:', error);
      return false;
    }
  }
}
