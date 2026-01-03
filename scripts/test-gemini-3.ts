
/**
 * 測試 gemini-3-flash-preview 連線
 * 使用方法：npx tsx scripts/test-gemini-3.ts
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 載入環境變數
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

async function testGemini3() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ 錯誤：找不到 GEMINI_API_KEY');
        return;
    }

    console.log('🔄 正在測試 gemini-3-flash-preview 連線...');
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const result = await model.generateContent('請用繁體中文回覆：Gemini 3 連線測試成功。');
        const response = await result.response;
        console.log('\n✅ 連線成功！');
        console.log('🤖 AI 回應：', response.text());
    } catch (error: any) {
        console.error('\n❌ 連線失敗');
        console.error('錯誤訊息：', error.message);

        // 如果失敗，列出目前可用的模型給使用者參考
        console.log('\n正在獲取可用模型列表...');
        try {
            const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await modelsResponse.json();
            console.log('目前您的 API Key 可用的模型有：');
            data.models?.forEach((m: any) => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } catch (e) {
            console.log('無法獲取模型列表。');
        }
    }
}

testGemini3();
