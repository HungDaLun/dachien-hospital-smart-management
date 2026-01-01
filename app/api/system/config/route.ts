/**
 * 系統設定 API 端點
 * GET /api/system/config - 取得系統設定（僅顯示狀態，不暴露敏感資訊）
 * PUT /api/system/config - 更新系統設定（僅 SUPER_ADMIN）
 */
import { NextRequest, NextResponse } from 'next/server';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';

/**
 * GET /api/system/config
 * 取得系統設定狀態（不暴露實際 API Key）
 */
export async function GET(_request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    // 檢查環境變數是否存在（不暴露實際值）
    const config = {
      supabase: {
        url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_role_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      gemini: {
        api_key_configured: !!process.env.GEMINI_API_KEY,
        model_version: process.env.GEMINI_MODEL_VERSION || 'gemini-2.5-flash',
      },
      storage: {
        s3_endpoint_configured: !!process.env.S3_ENDPOINT,
        s3_access_key_configured: !!process.env.S3_ACCESS_KEY,
        s3_secret_key_configured: !!process.env.S3_SECRET_KEY,
        s3_bucket_configured: !!process.env.S3_BUCKET_NAME,
        s3_region_configured: !!process.env.S3_REGION,
      },
      app: {
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
 * 更新系統設定（目前僅支援部分設定，API Key 需透過環境變數設定）
 */
export async function PUT(request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const body = await request.json();
    const { gemini_model_version } = body;

    // 目前僅支援更新 Gemini 模型版本（其他設定需透過環境變數）
    // 注意：實際的 API Key 應該透過環境變數或密鑰管理服務設定，不應透過 API 更新

    if (gemini_model_version) {
      // 驗證模型版本
      const validModels = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
      ];

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

      // 注意：在實際環境中，這應該儲存到資料庫或設定檔
      // 目前僅回傳確認訊息
      return NextResponse.json({
        success: true,
        data: {
          message: '設定已更新（請注意：模型版本需透過環境變數 GEMINI_MODEL_VERSION 設定）',
          gemini_model_version,
        },
      });
    }

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

  } catch (error) {
    return toApiResponse(error);
  }
}
