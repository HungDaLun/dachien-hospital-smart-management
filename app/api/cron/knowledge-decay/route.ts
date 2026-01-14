import { NextRequest, NextResponse } from 'next/server';
import { updateAllDecayScores } from '@/lib/knowledge/decay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await updateAllDecayScores();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating decay scores:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
