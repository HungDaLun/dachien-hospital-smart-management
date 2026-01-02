import { NextRequest } from 'next/server';

/**
 * Check if the request has a valid Authorization header.
 * For this MVP, we accept a simple static token or verify presence.
 * In production, this should verify against Supabase Auth or API Keys table.
 */
export function checkAuth(req: NextRequest): boolean {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
        return false;
    }

    // Check strict format "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    // For MVP/Testing with Open WebUI, we accept 'test' or any non-empty token
    // You can enforce a specific token here, e.g., process.env.OPENAI_API_KEY
    if (!token || token.trim().length === 0) {
        return false;
    }

    // Optional: Check against a hardcoded secret for basic security
    // if (token !== 'test' && token !== process.env.CRON_SECRET) {
    //     return false;
    // }

    return true;
}
