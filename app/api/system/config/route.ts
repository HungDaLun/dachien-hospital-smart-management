/**
 * 系統設定 API 端點
 * GET /api/system/config - 取得系統設定（僅顯示狀態，不暴露敏感資訊）
 * PUT /api/system/config - 更新系統設定（僅 SUPER_ADMIN）
 */
import { NextRequest, NextResponse } from 'next/server';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/system/config
 * 取得系統設定狀態（不暴露實際 API Key）
 */
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const supabase = createAdminClient();

    // 嘗試從資料庫取得設定
    const { data: dbSettings } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, is_encrypted');

    // 將資料庫設定轉換為 map
    const settingsMap: Record<string, { value: string | null; encrypted: boolean }> = {};
    dbSettings?.forEach(s => {
      settingsMap[s.setting_key] = {
        value: s.setting_value,
        encrypted: s.is_encrypted
      };
    });

    // 組合設定（優先使用資料庫，fallback 到環境變數）
    const config = {
      gemini: {
        api_key_configured: !!(settingsMap['gemini_api_key']?.value || process.env.GEMINI_API_KEY),
        api_key_source: settingsMap['gemini_api_key']?.value ? 'database' : (process.env.GEMINI_API_KEY ? 'env' : 'none'),
        model_version: settingsMap['gemini_model_version']?.value || process.env.GEMINI_MODEL_VERSION || 'gemini-3-flash-preview',
      },
      storage: {
        s3_endpoint_configured: !!(settingsMap['s3_endpoint']?.value || process.env.S3_ENDPOINT),
        s3_endpoint_source: settingsMap['s3_endpoint']?.value ? 'database' : (process.env.S3_ENDPOINT ? 'env' : 'none'),
        s3_access_key_configured: !!(settingsMap['s3_access_key']?.value || process.env.S3_ACCESS_KEY),
        s3_access_key_source: settingsMap['s3_access_key']?.value ? 'database' : (process.env.S3_ACCESS_KEY ? 'env' : 'none'),
        s3_secret_key_configured: !!(settingsMap['s3_secret_key']?.value || process.env.S3_SECRET_KEY),
        s3_secret_key_source: settingsMap['s3_secret_key']?.value ? 'database' : (process.env.S3_SECRET_KEY ? 'env' : 'none'),
        s3_bucket: settingsMap['s3_bucket']?.value || process.env.S3_BUCKET_NAME || '',
        s3_region: settingsMap['s3_region']?.value || process.env.S3_REGION || '',
      },
      app: {
        app_url: settingsMap['app_url']?.value || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        node_env: process.env.NODE_ENV || 'development',
      },
    };

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error) {
    return toApiResponse(error);
  }
}

/**
 * PUT /api/system/config
 * 更新系統設定
 */
export async function PUT(request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const body = await request.json();
    const {
      gemini_model_version,
      gemini_api_key,
      s3_endpoint,
      s3_access_key,
      s3_secret_key,
      s3_bucket,
      s3_region,
      app_url,
      // 二次驗證密碼（用於敏感設定）
      confirm_password
    } = body;

    const supabase = createAdminClient();
    const updates: Array<{ key: string; value: string | null; encrypted: boolean }> = [];
    const requireConfirmation: string[] = [];

    // 檢查哪些設定需要二次驗證
    if (gemini_api_key !== undefined) requireConfirmation.push('gemini_api_key');
    if (s3_access_key !== undefined) requireConfirmation.push('s3_access_key');
    if (s3_secret_key !== undefined) requireConfirmation.push('s3_secret_key');
    if (s3_endpoint !== undefined) requireConfirmation.push('s3_endpoint');

    // 如果有需要二次驗證的設定，但沒有提供密碼確認
    if (requireConfirmation.length > 0 && !confirm_password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: '修改敏感設定需要輸入密碼確認',
            requires_confirmation: true,
            fields: requireConfirmation,
          },
        },
        { status: 400 }
      );
    }

    // 如果提供了密碼確認，驗證密碼
    if (confirm_password) {
      const { createClient } = await import('@/lib/supabase/server');
      const userSupabase = await createClient();

      // 取得當前使用者 email
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user?.email) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: '無法取得使用者資訊',
            },
          },
          { status: 401 }
        );
      }

      // 驗證密碼
      const { error: signInError } = await userSupabase.auth.signInWithPassword({
        email: user.email,
        password: confirm_password,
      });

      if (signInError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: '密碼驗證失敗',
            },
          },
          { status: 401 }
        );
      }
    }

    // 驗證並收集更新
    if (gemini_model_version !== undefined) {
      const validModels = ['gemini-3-flash-preview', 'gemini-3-pro-preview'];
      if (!validModels.includes(gemini_model_version)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `無效的模型版本。支援的版本：${validModels.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }
      updates.push({ key: 'gemini_model_version', value: gemini_model_version, encrypted: false });
    }

    if (gemini_api_key !== undefined) {
      updates.push({ key: 'gemini_api_key', value: gemini_api_key || null, encrypted: true });
    }

    if (s3_endpoint !== undefined) {
      updates.push({ key: 's3_endpoint', value: s3_endpoint || null, encrypted: true });
    }

    if (s3_access_key !== undefined) {
      updates.push({ key: 's3_access_key', value: s3_access_key || null, encrypted: true });
    }

    if (s3_secret_key !== undefined) {
      updates.push({ key: 's3_secret_key', value: s3_secret_key || null, encrypted: true });
    }

    if (s3_bucket !== undefined) {
      updates.push({ key: 's3_bucket', value: s3_bucket || null, encrypted: false });
    }

    if (s3_region !== undefined) {
      updates.push({ key: 's3_region', value: s3_region || null, encrypted: false });
    }

    if (app_url !== undefined) {
      updates.push({ key: 'app_url', value: app_url || null, encrypted: false });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請提供要更新的設定',
          },
        },
        { status: 400 }
      );
    }

    // 執行更新 (upsert)
    for (const update of updates) {
      // 先取得舊值用於審計
      const { data: oldSetting } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', update.key)
        .single();

      // 更新設定
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: update.key,
          setting_value: update.value,
          is_encrypted: update.encrypted,
          updated_at: new Date().toISOString(),
          updated_by: profile.id,
        }, {
          onConflict: 'setting_key',
        });

      if (error) {
        console.error(`更新設定 ${update.key} 失敗:`, error);
        continue;
      }

      // 記錄審計日誌（敏感資料遮蔽）
      const maskedOldValue = update.encrypted ? '***' : oldSetting?.setting_value;
      const maskedNewValue = update.encrypted ? '***' : update.value;

      await supabase
        .from('system_settings_audit')
        .insert({
          setting_key: update.key,
          old_value: maskedOldValue,
          new_value: maskedNewValue,
          changed_by: profile.id,
          changed_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '設定已更新',
        updated_keys: updates.map(u => u.key),
      },
    });

  } catch (error) {
    return toApiResponse(error);
  }
}
