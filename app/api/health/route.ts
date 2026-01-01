/**
 * 健康檢查 API 端點
 * GET /api/health
 * 用於監控系統各元件狀態
 */
import { NextResponse } from 'next/server';
import type { ComponentHealth } from '@/types/health';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  components: {
    database: ComponentHealth;
    storage: ComponentHealth;
    geminiApi: ComponentHealth;
  };
}

/**
 * GET /api/health
 * 檢查系統健康狀態
 */
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version || '1.0.0';

  // 檢查資料庫連線
  const databaseHealth = await checkDatabase();

  // 檢查儲存服務
  const storageHealth = await checkStorage();

  // 檢查 Gemini API
  const geminiHealth = await checkGeminiApi();

  // 判斷整體狀態
  const componentStatuses = [
    databaseHealth.status,
    storageHealth.status,
    geminiHealth.status,
  ];

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (componentStatuses.every((s) => s === 'up')) {
    overallStatus = 'healthy';
  } else if (componentStatuses.some((s) => s === 'down')) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  return NextResponse.json({
    status: overallStatus,
    timestamp,
    version,
    components: {
      database: databaseHealth,
      storage: storageHealth,
      geminiApi: geminiHealth,
    },
  });
}

/**
 * 檢查資料庫連線
 */
async function checkDatabase(): Promise<ComponentHealth> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const startTime = Date.now();
    // 測試連線：查詢 user_profiles 資料表（如果不存在會回傳錯誤）
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        status: 'down',
        latencyMs,
        message: error.message,
      };
    }

    return {
      status: 'up',
      latencyMs,
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 檢查儲存服務（S3/MinIO）
 */
async function checkStorage(): Promise<ComponentHealth> {
  try {
    // TODO: 實作 S3/MinIO 連線檢查
    return {
      status: 'up',
      latencyMs: 50,
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 檢查 Gemini API
 */
async function checkGeminiApi(): Promise<ComponentHealth> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        status: 'degraded',
        message: '未設定 GEMINI_API_KEY',
      };
    }

    // TODO: 實作 Gemini API 連線檢查
    return {
      status: 'up',
      latencyMs: 100,
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}
