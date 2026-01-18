/**
 * 登出 API 端點
 * POST /api/auth/logout
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Logout] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '登出時發生錯誤' },
      { status: 500 }
    );
  }
}
