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

    // ✅ 修復：驗證 token 是否為有效的 API 金鑰
    const validApiKey = process.env.OPENAI_BRIDGE_API_KEY;

    if (!validApiKey) {
        console.error('[API Auth] OPENAI_BRIDGE_API_KEY 未設定');
        return false;
    }

    return token === validApiKey;
}
