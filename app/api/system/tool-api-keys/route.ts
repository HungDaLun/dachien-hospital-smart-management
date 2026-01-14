/**
 * MCP 工具 API Key 設定 API
 * GET /api/system/tool-api-keys - 取得需要 API Key 的工具列表
 * PUT /api/system/tool-api-keys - 更新工具的 API Key
 */
import { NextRequest, NextResponse } from 'next/server';
import { toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface ToolApiKeyConfig {
    key: string;
    name: string;
    description: string;
    placeholder?: string;
    required_for?: string[];
}

interface ToolWithApiKeyRequirement {
    id: string;
    name: string;
    display_name: string;
    icon: string;
    category: string;
    api_key_config: Record<string, ToolApiKeyConfig>;
    configured_keys: Record<string, { configured: boolean; source: 'database' | 'env' | 'none' }>;
}

/**
 * GET /api/system/tool-api-keys
 * 取得需要 API Key 的工具列表及其配置狀態
 */
export async function GET(_request: NextRequest) {
    try {
        // 檢查權限（僅 SUPER_ADMIN）
        const profile = await getCurrentUserProfile();
        requireSuperAdmin(profile);

        const supabase = createAdminClient();

        // 取得需要 API Key 的工具
        const { data: tools, error } = await supabase
            .from('tools_registry')
            .select('id, name, display_name, icon, category, api_key_config')
            .eq('requires_api_key', true)
            .eq('is_active', true)
            .order('category', { ascending: true });

        if (error) {
            console.error('Error fetching tools:', error);
            throw new Error('無法取得工具列表');
        }

        // 取得已儲存的 API Key 設定
        const { data: apiKeySettings } = await supabase
            .from('system_settings')
            .select('setting_key, setting_value')
            .like('setting_key', 'tool_api_key_%');

        // 建立設定 map
        const settingsMap: Record<string, string | null> = {};
        apiKeySettings?.forEach(s => {
            settingsMap[s.setting_key] = s.setting_value;
        });

        // 組裝回應
        const toolsWithStatus: ToolWithApiKeyRequirement[] = (tools || []).map(tool => {
            const apiKeyConfig = tool.api_key_config as Record<string, ToolApiKeyConfig> || {};
            const configuredKeys: Record<string, { configured: boolean; source: 'database' | 'env' | 'none' }> = {};

            // 檢查每個 API Key 的配置狀態
            Object.entries(apiKeyConfig).forEach(([configKey, config]) => {
                const dbKey = `tool_api_key_${tool.name}_${config.key}`;
                const envKey = config.key.toUpperCase();

                const hasDbValue = !!settingsMap[dbKey];
                const hasEnvValue = !!process.env[envKey];

                configuredKeys[configKey] = {
                    configured: hasDbValue || hasEnvValue,
                    source: hasDbValue ? 'database' : (hasEnvValue ? 'env' : 'none'),
                };
            });

            return {
                id: tool.id,
                name: tool.name,
                display_name: tool.display_name,
                icon: tool.icon,
                category: tool.category,
                api_key_config: apiKeyConfig,
                configured_keys: configuredKeys,
            };
        });

        return NextResponse.json({
            success: true,
            data: toolsWithStatus,
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * PUT /api/system/tool-api-keys
 * 更新工具的 API Key
 */
export async function PUT(request: NextRequest) {
    try {
        // 檢查權限（僅 SUPER_ADMIN）
        const profile = await getCurrentUserProfile();
        requireSuperAdmin(profile);

        const body = await request.json();
        const { tool_name, config_key, api_key, confirm_password } = body;

        if (!tool_name || !config_key) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: '請提供工具名稱和設定鍵' },
                },
                { status: 400 }
            );
        }

        // 需要密碼確認
        if (!confirm_password) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'CONFIRMATION_REQUIRED',
                        message: '修改 API Key 需要輸入密碼確認',
                        requires_confirmation: true,
                    },
                },
                { status: 400 }
            );
        }

        // 驗證密碼
        const { createClient } = await import('@/lib/supabase/server');
        const userSupabase = await createClient();
        const { data: { user } } = await userSupabase.auth.getUser();

        if (!user?.email) {
            return NextResponse.json(
                { success: false, error: { code: 'AUTH_ERROR', message: '無法取得使用者資訊' } },
                { status: 401 }
            );
        }

        const { error: signInError } = await userSupabase.auth.signInWithPassword({
            email: user.email,
            password: confirm_password,
        });

        if (signInError) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_PASSWORD', message: '密碼驗證失敗' } },
                { status: 401 }
            );
        }

        // 儲存 API Key
        const supabase = createAdminClient();
        const settingKey = `tool_api_key_${tool_name}_${config_key}`;

        const { error: upsertError } = await supabase
            .from('system_settings')
            .upsert({
                setting_key: settingKey,
                setting_value: api_key || null,
                is_encrypted: true,
                updated_at: new Date().toISOString(),
                updated_by: profile.id,
            }, {
                onConflict: 'setting_key',
            });

        if (upsertError) {
            console.error('Error saving API key:', upsertError);
            throw new Error('儲存 API Key 失敗');
        }

        // 記錄審計日誌
        await supabase
            .from('system_settings_audit')
            .insert({
                setting_key: settingKey,
                old_value: '***',
                new_value: '***',
                changed_by: profile.id,
                changed_at: new Date().toISOString(),
            });

        return NextResponse.json({
            success: true,
            data: { message: 'API Key 已更新' },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
