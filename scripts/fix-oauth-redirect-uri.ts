/**
 * 修復腳本：檢查並修復 Google OAuth Redirect URI
 * 確保資料庫中的設定不包含 localhost:8080
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 載入環境變數
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function fixOAuthRedirectUri() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 環境變數');
    console.log('需要：NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 檢查 Google OAuth Redirect URI 設定...\n');

  // 1. 檢查當前的 redirect URI
  const { data: currentSetting, error: fetchError } = await supabase
    .from('system_settings')
    .select('setting_key, setting_value')
    .eq('setting_key', 'google_oauth_redirect_uri')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('❌ 查詢資料庫失敗:', fetchError);
    process.exit(1);
  }

  const currentValue = currentSetting?.setting_value;
  console.log('📋 當前的 redirect URI:', currentValue || '(未設定)');

  // 2. 檢查 app_url
  const { data: appUrlSetting } = await supabase
    .from('system_settings')
    .select('setting_key, setting_value')
    .eq('setting_key', 'app_url')
    .single();

  const appUrl = appUrlSetting?.setting_value || process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ai.zeabur.app';
  console.log('📋 當前的 app_url:', appUrl);

  // 3. 檢查是否需要修復
  const needsFix = currentValue?.includes('localhost:8080') || 
                   currentValue?.includes('8080') ||
                   !currentValue?.includes('/calendar/callback');

  if (needsFix) {
    console.log('\n⚠️  發現問題，需要修復！\n');

    // 計算正確的 redirect URI
    const correctRedirectUri = `${appUrl}/api/auth/google/calendar/callback`;
    console.log('✅ 正確的 redirect URI:', correctRedirectUri);

    // 更新資料庫
    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'google_oauth_redirect_uri',
        setting_value: correctRedirectUri,
        is_encrypted: false,
        description: 'Google OAuth Redirect URI',
      }, {
        onConflict: 'setting_key',
      });

    if (updateError) {
      console.error('❌ 更新資料庫失敗:', updateError);
      process.exit(1);
    }

    console.log('\n✅ 已成功更新資料庫設定！');
    console.log(`   舊值: ${currentValue || '(未設定)'}`);
    console.log(`   新值: ${correctRedirectUri}`);
  } else {
    console.log('\n✅ 設定正確，無需修復');
  }

  // 4. 檢查環境變數
  console.log('\n📋 環境變數檢查：');
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envAppUrl?.includes('8080')) {
    console.log('  ⚠️  警告：NEXT_PUBLIC_APP_URL 包含 8080');
    console.log(`     值：${envAppUrl}`);
    console.log('  💡 建議：請檢查 .env.local 檔案');
  } else {
    console.log(`  NEXT_PUBLIC_APP_URL: ${envAppUrl || '(未設定)'}`);
  }

  console.log('\n✨ 檢查完成！');
}

fixOAuthRedirectUri().catch(console.error);
