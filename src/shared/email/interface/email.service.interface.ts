export interface ISendGridEmailOptions {
  from?: string; // From address
  to: string | string[]; // Recipient(s)
  subject: string; // Email subject
  text?: string; // Plain text version of the email
  html?: string; // HTML version of the email
  template?: string; // Name of the template (optional)
  context?: Record<string, any>; // Variables to pass into the template
}

