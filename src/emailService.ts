import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log('Email sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
