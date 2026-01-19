/**
 * 專門測試 Gemini v3 Preview 模型
 * 目標模型：
 * - gemini-3-pro-preview
 * - gemini-3-flash-preview
 *
 * 使用方式：
 *   npx tsx scripts/test_gemini_v3_preview.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// 載入 .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🔍 測試 Gemini v3 Preview 模型...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ 找不到 GEMINI_API_KEY，請先在 .env.local 設定');
    process.exit(1);
  }

  console.log(`✅ 已讀取 GEMINI_API_KEY（前 10 碼）：${apiKey.slice(0, 10)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = ['gemini-3-pro-preview', 'gemini-3-flash-preview'] as const;

  for (const modelName of modelsToTest) {
    console.log(`\n=== 測試模型：${modelName} ===`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const start = Date.now();
      const result = await model.generateContent('請用繁體中文回覆：「這是一個測試」');
      const resp = await result.response;
      const latency = Date.now() - start;

      console.log(`✅ 呼叫成功 (${latency}ms)`);
      console.log('AI 回應：', resp.text());
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number; statusText?: string; errorDetails?: unknown };
      console.error('❌ 呼叫失敗');
      console.error('錯誤訊息：', err.message || String(error));
      if (typeof err.status !== 'undefined') {
        console.error('HTTP 狀態碼：', err.status, err.statusText || '');
      }
      if (err.errorDetails) {
        console.error('errorDetails：', JSON.stringify(err.errorDetails, null, 2));
      }
    }
  }

  console.log('\n🔚 測試結束。');
}

main().catch((err) => {
  console.error('腳本執行發生未預期錯誤：', err);
  process.exit(1);
});

