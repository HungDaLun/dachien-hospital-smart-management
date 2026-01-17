import { ToolContext } from '../types';

export async function send_email(params: Record<string, unknown>, _context: ToolContext) {
    const { to, subject, body } = params as { to: string; subject: string; body: string };

    // Validate params
    if (!to || !subject || !body) {
        throw new Error("Missing required parameters: to, subject, body");
    }

    // TODO: Integrate actual Resend or Nodemailer
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);

    return {
        success: true,
        message: `Email sent to ${to}`,
        messageId: "mock-message-id-" + Date.now()
    };
}

export const sendEmail = send_email;


export async function send_notification(params: Record<string, unknown>, _context: ToolContext) {
    const { channel, message } = params as { channel: string; message: string };

    // This tool normally requires an API Key config
    // We would check `context.organizationId` -> get key -> send

    console.log(`[Mock Notification] Channel: ${channel}, Message: ${message}`);

    return {
        success: true,
        message: `Notification sent to ${channel}`
    };
}

export const sendNotification = send_notification;
