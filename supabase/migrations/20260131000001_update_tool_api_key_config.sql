-- =============================================
-- 更新工具的 API Key 配置
-- 建立日期: 2026-01-14
-- 說明: 為需要 API Key 的工具定義其配置結構
-- =============================================

-- 更新 send_notification 工具的 api_key_config
UPDATE tools_registry
SET api_key_config = '{
  "line": {
    "key": "line_channel_token",
    "name": "Line Channel Access Token",
    "description": "從 Line Developers Console 取得的 Channel Access Token",
    "placeholder": "輸入 Line Channel Access Token...",
    "required_for": ["line"]
  },
  "slack": {
    "key": "slack_webhook_url",
    "name": "Slack Webhook URL",
    "description": "從 Slack App 設定取得的 Incoming Webhook URL",
    "placeholder": "https://hooks.slack.com/services/...",
    "required_for": ["slack"]
  }
}'::jsonb
WHERE name = 'send_notification';

-- 更新 web_search 工具的 api_key_config
UPDATE tools_registry
SET api_key_config = '{
  "serper": {
    "key": "serper_api_key",
    "name": "Serper API Key",
    "description": "從 serper.dev 取得的 API Key，用於 Google 搜尋",
    "placeholder": "輸入 Serper API Key..."
  },
  "tavily": {
    "key": "tavily_api_key",
    "name": "Tavily API Key",
    "description": "從 tavily.com 取得的 API Key，用於 AI 搜尋",
    "placeholder": "輸入 Tavily API Key..."
  }
}'::jsonb
WHERE name = 'web_search';

-- ============================================
-- Migration 完成
-- ============================================
