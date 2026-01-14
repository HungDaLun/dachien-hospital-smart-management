-- =============================================
-- API 密鑰設定擴展 - Migration
-- 建立日期: 2026-01-14
-- 說明: 確保 system_settings 表能支援新增的 API 密鑰設定
-- =============================================

-- 此 Migration 無需修改資料表結構
-- system_settings 表已使用 key-value 結構，可直接新增設定項目
-- 這裡僅記錄預期的設定項目，供日後參考

-- 預期的設定項目清單:
-- ===== 原有設定 =====
-- gemini_api_key          - Gemini API 密鑰 (加密)
-- gemini_model_version    - Gemini 模型版本
-- s3_endpoint             - S3 端點 (加密)
-- s3_access_key           - S3 存取金鑰 (加密)
-- s3_secret_key           - S3 密鑰 (加密)
-- s3_bucket               - S3 Bucket 名稱
-- s3_region               - S3 區域
-- app_url                 - 應用程式 URL

-- ===== 新增設定 =====
-- email_provider          - 郵件服務商 (resend/sendgrid)
-- resend_api_key          - Resend API 密鑰 (加密)
-- sendgrid_api_key        - SendGrid API 密鑰 (加密)
-- news_api_key            - News API 密鑰 (加密)
-- line_channel_token      - Line Channel Access Token (加密)
-- slack_webhook_url       - Slack Webhook URL (加密)
-- web_search_api_key      - 網路搜尋 API 密鑰 (加密)
-- cron_secret             - 排程任務密鑰 (加密)

-- 插入預設設定（如果不存在）
INSERT INTO system_settings (setting_key, setting_value, is_encrypted, description)
VALUES 
    ('email_provider', 'resend', FALSE, '郵件服務商: resend 或 sendgrid')
ON CONFLICT (setting_key) DO NOTHING;

-- 新增設定描述註解（用於文件參考）
COMMENT ON TABLE system_settings IS '系統設定表 - 儲存 API 密鑰與系統配置。支援的設定項目包含: gemini_api_key, s3_*, email_*, news_api_key, line_channel_token, slack_webhook_url, web_search_api_key, cron_secret 等。';

-- ============================================
-- Migration 完成
-- ============================================
