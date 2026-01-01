/**
 * 使用者個人資料 API 端點
 * 用於更新使用者自己的個人資料
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET - 取得當前使用者的個人資料
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 驗證使用者身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '未授權' },
        { status: 401 }
      );
    }

    // 取得使用者資料
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('取得使用者資料失敗:', error);
      return NextResponse.json(
        { success: false, error: '無法取得使用者資料' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新當前使用者的個人資料
 * 使用者只能更新自己的 display_name，不能修改 role 或 department_id
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 驗證使用者身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '未授權' },
        { status: 401 }
      );
    }

    // 解析請求資料
    const body = await request.json();
    const { display_name } = body;

    // 驗證資料
    if (display_name !== undefined && typeof display_name !== 'string') {
      return NextResponse.json(
        { success: false, error: '顯示名稱格式錯誤' },
        { status: 400 }
      );
    }

    // 只允許更新 display_name
    const updateData: { display_name?: string } = {};
    if (display_name !== undefined) {
      updateData.display_name = display_name.trim() || null;
    }

    // 更新使用者資料
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('更新使用者資料失敗:', error);
      return NextResponse.json(
        { success: false, error: '無法更新使用者資料' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}