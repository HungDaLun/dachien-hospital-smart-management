/**
 * GEMINI_API_KEY 驗證腳本
 * 用於驗證環境變數中的 Gemini API Key 是否正確設定並可正常使用
 * 
 * 使用方法：
 *   npx tsx scripts/verify-gemini-key.ts
 *   或
 *   npm run verify:gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 載入環境變數（優先從 .env.local，然後是 .env）
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

// 先載入 .env（如果存在）
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// 再載入 .env.local（會覆蓋 .env 的值）
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * 驗證 Gemini API Key
 */
async function verifyGeminiKey(): Promise<void> {
  console.log('🔍 開始驗證 GEMINI_API_KEY...\n');

  // 步驟 1: 檢查環境變數是否存在
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ 錯誤：未找到 GEMINI_API_KEY 環境變數');
    console.log('\n📝 請確認：');
    console.log('   1. 已在專案根目錄建立 .env.local 檔案');
    console.log('   2. .env.local 中包含：GEMINI_API_KEY=你的_api_key');
    console.log('   3. API Key 格式正確（應以 AIzaSy 開頭）\n');
    process.exit(1);
  }

  // 檢查 API Key 格式（Google API Key 通常以 AIzaSy 開頭）
  if (!apiKey.startsWith('AIzaSy')) {
    console.warn('⚠️  警告：API Key 格式可能不正確（應以 AIzaSy 開頭）');
    console.log(`   目前格式：${apiKey.substring(0, 10)}...\n`);
  } else {
    console.log('✅ 環境變數已設定');
    // 顯示前 15 個字元以便確認是否為最新值
    const maskedKey = apiKey.length > 20 
      ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`
      : `${apiKey.substring(0, 10)}...`;
    console.log(`   API Key：${maskedKey}`);
    console.log(`   長度：${apiKey.length} 字元\n`);
  }

  // 步驟 2: 測試 API 連線
  console.log('🔄 測試 Gemini API 連線...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 先嘗試列出可用模型
    console.log('   正在檢查可用模型...');
    let availableModels: string[] = [];
    
    try {
      // 嘗試使用 REST API 列出模型（如果 SDK 支援）
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          availableModels = data.models
            .map((m: any) => m.name?.replace('models/', '') || '')
            .filter((name: string) => name.includes('gemini'));
          console.log(`   ✅ 找到 ${availableModels.length} 個可用模型：`);
          availableModels.slice(0, 5).forEach((name: string) => {
            console.log(`      - ${name}`);
          });
        }
      }
    } catch (err) {
      console.log('   ℹ️  無法列出模型列表，將直接測試常用模型');
    }
    
    // 嘗試使用不同的模型名稱（優先使用新版本）
    const modelNames = availableModels.length > 0 
      ? availableModels.slice(0, 3)
      : [
          'gemini-2.5-flash',
          'gemini-2.5-pro',
          'gemini-2.0-flash',
          'gemini-2.0-flash-exp',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
        ];
    
    let model = null;
    let workingModelName = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`   正在測試模型：${modelName}...`);
        model = genAI.getGenerativeModel({ model: modelName });
        // 嘗試生成內容來測試模型是否可用
        const testResult = await model.generateContent('Hi');
        await testResult.response;
        workingModelName = modelName;
        console.log(`   ✅ 模型可用：${modelName}`);
        break;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`   ❌ ${modelName} 不可用（404）`);
        } else {
          console.log(`   ⚠️  ${modelName} 測試失敗：${errorMsg.substring(0, 50)}...`);
        }
        continue;
      }
    }
    
    if (!model || !workingModelName) {
      throw new Error('所有測試的模型都無法使用。請確認已啟用 Generative Language API。');
    }

    // 發送一個簡單的測試請求
    console.log(`\n   使用模型 ${workingModelName} 進行完整測試...`);
    const startTime = Date.now();
    const result = await model.generateContent('請用繁體中文回覆「測試成功」');
    const latencyMs = Date.now() - startTime;

    const response = await result.response;
    const text = response.text();

    console.log('\n✅ API 連線成功！');
    console.log(`   使用模型：${workingModelName}`);
    console.log(`   回應時間：${latencyMs}ms`);
    console.log(`   AI 回應：${text}\n`);

    // 步驟 3: 檢查其他模型可用性
    console.log('📊 檢查其他模型可用性...');
    
    const otherModels = ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    for (const modelName of otherModels) {
      if (modelName === workingModelName) continue;
      
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        await testModel.generateContent('test');
        console.log(`   ✅ ${modelName} 可用`);
      } catch (error) {
        console.log(`   ℹ️  ${modelName} 不可用或需要額外權限`);
      }
    }

    console.log('\n🎉 驗證完成！GEMINI_API_KEY 設定正確且可正常使用。\n');

  } catch (error: unknown) {
    console.error('\n❌ API 連線失敗：\n');

    if (error instanceof Error) {
      // 顯示完整錯誤訊息
      console.error(`   完整錯誤訊息：${error.message}`);
      
      // 嘗試從錯誤物件中提取更多資訊
      const errorObj = error as any;
      if (errorObj.status) {
        console.error(`   HTTP 狀態碼：${errorObj.status}`);
      }
      if (errorObj.statusText) {
        console.error(`   狀態文字：${errorObj.statusText}`);
      }
      if (errorObj.cause) {
        console.error(`   原因：${errorObj.cause}`);
      }
      console.log('');

      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('api key') || errorMessage.includes('invalid') || errorMessage.includes('401') || errorMessage.includes('403')) {
        console.error('   錯誤類型：API Key 無效或未授權');
        console.log('\n📝 可能的原因：');
        console.log('   1. API Key 已過期或被撤銷');
        console.log('   2. API Key 格式錯誤');
        console.log('   3. 未啟用 Generative Language API');
        console.log('   4. API Key 沒有存取 Gemini API 的權限');
        console.log('\n💡 解決方法：');
        console.log('   1. 前往 https://aistudio.google.com/apikey 檢查或重新建立 API Key');
        console.log('   2. 前往 Google Cloud Console (https://console.cloud.google.com/)');
        console.log('      → 選擇對應的專案');
        console.log('      → 前往「API 和服務」→「程式庫」');
        console.log('      → 搜尋「Generative Language API」並啟用');
        console.log('   3. 確認 API Key 對應的專案已啟用計費（免費配額也需要）');
        console.log('   4. 檢查 API Key 是否有 IP 或網域限制\n');
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        console.error('   錯誤類型：配額或速率限制');
        console.log('\n📝 可能的原因：');
        console.log('   1. API 使用量已達上限');
        console.log('   2. 請求頻率過高');
        console.log('\n💡 解決方法：');
        console.log('   1. 前往 Google Cloud Console 檢查配額使用情況');
        console.log('   2. 等待一段時間後重試');
        console.log('   3. 考慮升級 API 配額\n');
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        console.error('   錯誤類型：網路連線問題');
        console.log('\n💡 解決方法：');
        console.log('   1. 檢查網路連線');
        console.log('   2. 確認防火牆設定');
        console.log('   3. 稍後重試\n');
      } else {
        console.error(`   錯誤訊息：${error.message}\n`);
      }
    } else {
      console.error(`   未知錯誤：${String(error)}\n`);
    }

    process.exit(1);
  }
}

// 執行驗證
verifyGeminiKey().catch((error) => {
  console.error('❌ 驗證過程發生未預期的錯誤：', error);
  process.exit(1);
});
