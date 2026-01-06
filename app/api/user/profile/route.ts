/**
 * 使用者個人資料 API 端點
 * 用於更新使用者自己的個人資料
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 此路由使用 cookies 進行身份驗證，必須為動態路由
export const dynamic = 'force-dynamic';

// 使用者可自行編輯的欄位白名單
const EDITABLE_FIELDS = [
  'display_name',
  'phone',
  'mobile',
  'bio',
  'skills',
  'expertise_areas',
  'linkedin_url',
  'preferences',
] as const;

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

    // 取得使用者資料，包含主管資訊
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        manager:manager_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
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
 * 使用者只能更新白名單內的欄位，不能修改 role、department_id 或其他管理員欄位
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

    // 只允許更新白名單內的欄位
    const updateData: Record<string, unknown> = {};

    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) {
        const value = body[field];

        // 驗證欄位格式
        switch (field) {
          case 'display_name':
            if (value !== null && typeof value !== 'string') {
              return NextResponse.json(
                { success: false, error: '顯示名稱格式錯誤' },
                { status: 400 }
              );
            }
            updateData[field] = value?.trim() || null;
            break;

          case 'phone':
          case 'mobile':
            if (value !== null && typeof value !== 'string') {
              return NextResponse.json(
                { success: false, error: `${field} 格式錯誤` },
                { status: 400 }
              );
            }
            // 簡單的電話格式驗證（允許數字、+、-、空格、括號）
            if (value && !/^[\d\s\-+()]+$/.test(value)) {
              return NextResponse.json(
                { success: false, error: `${field} 包含無效字元` },
                { status: 400 }
              );
            }
            updateData[field] = value?.trim() || null;
            break;

          case 'bio':
            if (value !== null && typeof value !== 'string') {
              return NextResponse.json(
                { success: false, error: '個人簡介格式錯誤' },
                { status: 400 }
              );
            }
            // 限制個人簡介長度
            if (value && value.length > 1000) {
              return NextResponse.json(
                { success: false, error: '個人簡介不可超過 1000 字元' },
                { status: 400 }
              );
            }
            updateData[field] = value?.trim() || null;
            break;

          case 'skills':
          case 'expertise_areas':
            if (value !== null && !Array.isArray(value)) {
              return NextResponse.json(
                { success: false, error: `${field} 必須為陣列格式` },
                { status: 400 }
              );
            }
            // 驗證陣列內容都是字串
            if (value && !value.every((item: unknown) => typeof item === 'string')) {
              return NextResponse.json(
                { success: false, error: `${field} 內容必須都是字串` },
                { status: 400 }
              );
            }
            updateData[field] = value || [];
            break;

          case 'linkedin_url':
            if (value !== null && typeof value !== 'string') {
              return NextResponse.json(
                { success: false, error: 'LinkedIn 連結格式錯誤' },
                { status: 400 }
              );
            }
            // 驗證 LinkedIn URL 格式
            if (value && !value.includes('linkedin.com')) {
              return NextResponse.json(
                { success: false, error: '請輸入有效的 LinkedIn 連結' },
                { status: 400 }
              );
            }
            updateData[field] = value?.trim() || null;
            break;

          case 'preferences':
            if (value !== null && typeof value !== 'object') {
              return NextResponse.json(
                { success: false, error: '偏好設定格式錯誤' },
                { status: 400 }
              );
            }
            updateData[field] = value || {};
            break;

          default:
            updateData[field] = value;
        }
      }
    }

    // 如果沒有可更新的欄位
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '沒有提供可更新的欄位' },
        { status: 400 }
      );
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