/**
 * 註冊 API 端點
 * POST /api/auth/register
 * 建立新使用者帳號並自動建立 user_profiles
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ValidationError, toApiResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, password, display_name } = body;

    // 驗證必填欄位
    if (!email || !password) {
      throw new ValidationError('請提供電子郵件和密碼');
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('請提供有效的電子郵件地址');
    }

    // 驗證密碼長度（至少 6 個字元）
    if (password.length < 6) {
      throw new ValidationError('密碼長度至少需要 6 個字元');
    }

    // 使用 Supabase Auth 建立使用者
    // 設定不需要郵件驗證，直接啟用帳號
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // 不需要郵件驗證
        data: {
          display_name: display_name || email.split('@')[0], // 預設使用 email 前綴
        },
      },
    });

    if (signUpError) {
      // 處理常見錯誤
      if (signUpError.message.includes('already registered')) {
        throw new ValidationError('此電子郵件已被註冊');
      }
      if (signUpError.message.includes('Password')) {
        throw new ValidationError('密碼不符合要求');
      }
      throw new ValidationError(signUpError.message);
    }

    if (!authData.user) {
      throw new ValidationError('註冊失敗，請稍後再試');
    }

    // 使用 Admin client 來建立 user_profiles，因為新使用者可能無法通過 RLS
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    // 如果 Supabase 要求郵件驗證，使用 Admin API 自動確認郵件
    // 這樣使用者就不需要點擊郵件連結
    if (!authData.user.email_confirmed_at) {
      try {
        await adminClient.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true, // 自動確認郵件
        });
        console.log('已自動確認使用者郵件:', authData.user.email);
      } catch (confirmError) {
        console.warn('自動確認郵件失敗（可能不需要）:', confirmError);
        // 如果失敗，不影響註冊流程，繼續執行
      }
    }

    // 自動建立 user_profiles 記錄
    // 預設角色為 USER，狀態為 PENDING（待審核）
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        display_name: display_name || authData.user.email!.split('@')[0],
        role: 'USER', // 預設角色，管理員審核時可以修改
        status: 'PENDING', // 待審核狀態
      });

    if (profileError) {
      console.error('建立 user_profiles 失敗:', profileError);
      // 如果 user_profiles 建立失敗，嘗試刪除 auth.users 中的記錄
      // 注意：這需要 service role key，在生產環境中可能需要手動處理
      throw new ValidationError('建立使用者資料失敗，請聯絡管理員');
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        message: '註冊成功！您的帳號已建立，請等待管理員審核通過後即可使用。',
        requiresApproval: true,
      },
    }, { status: 201 });

  } catch (error) {
    return toApiResponse(error);
  }
}
