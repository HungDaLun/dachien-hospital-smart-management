#!/bin/bash

# 停止所有現有的 Node.js 進程
killall -9 node 2>/dev/null
sleep 2

# 設定正確的 API Key 並啟動開發伺服器
export GEMINI_API_KEY="AIzaSyATPx2Q_Lp3Aq4lKIlcQA2oMwuudfp0M54"

echo "🔑 使用 API Key: ${GEMINI_API_KEY:0:10}..."
echo "🚀 啟動開發伺服器..."

npm run dev
