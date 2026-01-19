#!/bin/bash

# 停止所有現有的 Node.js 進程
killall -9 node 2>/dev/null
sleep 2

# 從 .env.local 載入環境變數（包含 GEMINI_API_KEY）
# 說明：這樣只要更新 .env.local，就會自動套用到開發環境
if [ -f ".env.local" ]; then
  # 將 .env.local 內的 KEY=VALUE 全部匯入為環境變數
  set -a
  # shellcheck source=/dev/null
  . .env.local
  set +a
else
  echo "❌ 找不到 .env.local，請建立檔案並設定 GEMINI_API_KEY 後再執行。"
  exit 1
fi

# 檢查 GEMINI_API_KEY 是否已正確載入
if [ -z "${GEMINI_API_KEY}" ]; then
  echo "❌ GEMINI_API_KEY 未在 .env.local 中設定，請補上後再試一次。"
  exit 1
fi

echo "🔑 使用 API Key: ${GEMINI_API_KEY:0:10}..."
echo "🚀 啟動開發伺服器..."

npm run dev
