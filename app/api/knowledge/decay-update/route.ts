import { NextRequest, NextResponse } from 'next/server';
import { updateAllDecayScores } from '@/lib/knowledge/decay';

// Simple secret for basic protection (should be in env vars in production)
const CRON_SECRET = process.env.CRON_SECRET || 'knowledge_decay_secret_key';

export async function POST(req: NextRequest) {
    try {
        // 1. Authorization check
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Run update logic
        const result = await updateAllDecayScores();

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in decay update job:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
