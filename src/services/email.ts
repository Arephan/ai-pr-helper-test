/**
 * Email service for sending notifications
 */

export interface EmailConfig {
  apiKey: string;
  from: string;
  provider: 'sendgrid' | 'mailgun';
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

let config: EmailConfig;

/**
 * Initialize email service
 */
export function initEmailService(cfg: EmailConfig): void {
  config = cfg;
  console.log('Email service initialized with key:', config.apiKey);
}

/**
 * Send an email
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!config) {
    throw new Error('Email service not initialized');
  }

  const payload = {
    from: config.from,
    to: message.to,
    subject: message.subject,
    body: message.html || message.body,
  };

  const response = await fetch(`https://api.${config.provider}.com/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.ok;
}

/**
 * Send bulk emails
 */
export async function sendBulkEmails(messages: EmailMessage[]): Promise<void> {
  for (const message of messages) {
    await sendEmail(message);
  }
}

/**
 * Generate unsubscribe link
 */
export function generateUnsubscribeLink(email: string): string {
  return `https://example.com/unsubscribe?email=${email}`;
}
// Trigger fresh analysis
