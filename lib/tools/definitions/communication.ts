import { ToolContext } from '../types';

// @ts-ignore
export async function send_email(params: any, _context: ToolContext) {
    const { to, subject, body } = params;

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


// @ts-ignore
export async function send_notification(params: any, _context: ToolContext) {
    const { channel, message } = params;

    // This tool normally requires an API Key config
    // We would check `context.organizationId` -> get key -> send

    console.log(`[Mock Notification] Channel: ${channel}, Message: ${message}`);

    return {
        success: true,
        message: `Notification sent to ${channel}`
    };
}

export const sendNotification = send_notification;
