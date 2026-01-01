/**
 * 註冊 API 端點
 * POST /api/auth/register
 * 建立新使用者帳號並自動建立 user_profiles
 */
import { NextRequest, NextResponse } from 'next/server';
import { ValidationError, toApiResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
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

    // 使用 Admin client 來建立使用者，避免自動登入
    // 這樣可以確保註冊後不會自動建立 session
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    // 檢查使用者是否已存在
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      throw new ValidationError('此電子郵件已被註冊');
    }

    // 使用 Admin API 建立使用者（不會自動登入）
    const { data: authData, error: signUpError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自動確認郵件
      user_metadata: {
        display_name: display_name || email.split('@')[0],
      },
    });

    if (signUpError) {
      // 處理常見錯誤
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
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

    // 使用 Admin API 建立使用者時已經設定 email_confirm: true
    // 所以不需要再次確認郵件

    // 自動建立或更新 user_profiles 記錄
    // 使用 upsert 來處理觸發器可能已經建立記錄的情況
    // 預設角色為 USER，狀態為 PENDING（待審核）
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email!,
        display_name: display_name || authData.user.email!.split('@')[0],
        role: 'USER', // 預設角色，管理員審核時可以修改
        status: 'PENDING', // 待審核狀態
      }, {
        onConflict: 'id', // 如果 id 已存在，則更新
      });

    if (profileError) {
      console.error('建立 user_profiles 失敗:', profileError);
      // 如果 user_profiles 建立失敗，嘗試刪除 auth.users 中的記錄
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('刪除使用者失敗:', deleteError);
      }
      throw new ValidationError('建立使用者資料失敗，請聯絡管理員');
    }

    // 注意：使用 Admin API 建立使用者不會自動建立 session
    // 所以不需要清除 session，使用者需要手動登入

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
