/**
 * 診斷腳本：檢查 Google OAuth 設定
 * 用於找出 localhost:8080 的來源
 */

import { createClient } from '@supabase/supabase-js';

async function checkOAuthConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 環境變數');
    console.log('需要：NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 檢查 Google OAuth 相關設定...\n');

  // 1. 檢查環境變數
  console.log('📋 環境變數：');
  console.log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '(未設定)'}`);
  console.log(`  GOOGLE_OAUTH_REDIRECT_URI: ${process.env.GOOGLE_OAUTH_REDIRECT_URI || '(未設定)'}\n`);

  // 2. 檢查資料庫設定
  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('setting_key, setting_value, description')
    .in('setting_key', [
      'google_oauth_client_id',
      'google_oauth_client_secret',
      'google_oauth_redirect_uri',
      'app_url',
    ]);

  if (error) {
    console.error('❌ 查詢資料庫失敗:', error);
    process.exit(1);
  }

  console.log('💾 資料庫設定：');
  settings?.forEach(setting => {
    const value = setting.setting_key.includes('secret') 
      ? '(已加密)' 
      : setting.setting_value || '(NULL)';
    console.log(`  ${setting.setting_key}: ${value}`);
    if (setting.setting_value && setting.setting_value.includes('8080')) {
      console.log(`    ⚠️  警告：此設定包含 8080 端口！`);
    }
    if (setting.setting_value && setting.setting_value.includes('localhost:8080')) {
      console.log(`    🚨 發現問題：此設定包含 localhost:8080！`);
    }
  });

  console.log('\n🔎 分析結果：');
  
  const redirectUri = settings?.find(s => s.setting_key === 'google_oauth_redirect_uri')?.setting_value;
  const appUrl = settings?.find(s => s.setting_key === 'app_url')?.setting_value;
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (redirectUri?.includes('8080')) {
    console.log('  ❌ 資料庫中的 google_oauth_redirect_uri 包含 8080');
    console.log(`     值：${redirectUri}`);
  } else if (appUrl?.includes('8080')) {
    console.log('  ❌ 資料庫中的 app_url 包含 8080');
    console.log(`     值：${appUrl}`);
  } else if (envAppUrl?.includes('8080')) {
    console.log('  ❌ 環境變數 NEXT_PUBLIC_APP_URL 包含 8080');
    console.log(`     值：${envAppUrl}`);
  } else {
    console.log('  ✅ 未在設定中找到 8080');
    console.log('  💡 可能原因：');
    console.log('     1. 瀏覽器快取或 Cookie 中儲存了舊的 redirect URI');
    console.log('     2. Google OAuth 授權流程中使用了快取的 redirect URI');
    console.log('     3. 有其他環境變數或設定檔未被檢查到');
  }

  // 3. 檢查預期的 redirect URI
  console.log('\n📝 預期的 redirect URI：');
  const expectedUri = redirectUri || 
    `${envAppUrl || appUrl || 'https://nexus-ai.zeabur.app'}/api/auth/google/calendar/callback`;
  console.log(`  ${expectedUri}`);
  
  if (!expectedUri.includes('calendar')) {
    console.log('  ⚠️  警告：預期的 URI 不包含 /calendar/ 路徑段');
  }
}

checkOAuthConfig().catch(console.error);
