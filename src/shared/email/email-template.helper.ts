/**
 * Email Template Helper
 * Provides a consistent email template for all WhizCloud Events emails
 */

export interface EmailTemplateOptions {
  userName?: string;
  title?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  additionalInfo?: string;
  footerText?: string;
}

export function generateEmailTemplate(options: EmailTemplateOptions): string {
  const {
    userName = 'User',
    title,
    message,
    buttonText,
    buttonUrl,
    additionalInfo,
    footerText,
  } = options;

  const buttonHtml = buttonText && buttonUrl
    ? `
                <p style="text-align: center; margin: 30px 0;">
                  <a
                    href="${buttonUrl}"
                    style="
                      background-color: #007bff;
                      color: #ffffff;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 4px;
                      display: inline-block;
                      font-weight: bold;
                    "
                    >${buttonText}</a
                  >
                </p>
    `
    : '';

  const additionalInfoHtml = additionalInfo
    ? `
                <p style="font-size: 14px; color: #666;">
                  ${additionalInfo}
                </p>
    `
    : '';

  return `
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      bgcolor="#f4f4f4"
    >
      <tr>
        <td align="center" style="padding: 20px 0;">
          <!-- Main Container -->
          <table
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #ffffff; border-radius: 8px; overflow: hidden;"
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                bgcolor="#007BFF"
                style="padding: 20px; color: #ffffff; font-family: Arial, sans-serif;"
              >
                <h2 style="margin: 0; font-size: 24px;">WhizCloud Events</h2>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td
                style="padding: 30px; font-family: Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.6;"
              >
                <p>Hi ${userName},</p>
                <p>
                  ${message}
                </p>
                ${buttonHtml}
                ${additionalInfoHtml}
                <p>
                  If you didn't request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                bgcolor="#f1f1f1"
                style="padding: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 14px; color: #666666;"
              >
                © 2025 WhizCloud. All rights reserved.<br />
                ${footerText || ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Generate plain text version of email
 */
export function generateEmailText(options: EmailTemplateOptions): string {
  const {
    userName = 'User',
    message,
    buttonText,
    buttonUrl,
    additionalInfo,
  } = options;

  let text = `Hi ${userName},\n\n${message}\n\n`;

  if (buttonText && buttonUrl) {
    text += `${buttonText}: ${buttonUrl}\n\n`;
  }

  if (additionalInfo) {
    text += `${additionalInfo}\n\n`;
  }

  text += `If you didn't request this email, you can safely ignore it.\n\nBest regards,\nWhizCloud Events Team`;

  return text;
}

