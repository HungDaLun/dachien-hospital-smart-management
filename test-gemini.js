// 測試 Gemini API Key
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyATPx2Q_Lp3Aq4lKIlcQA2oMwuudfp0M54';

console.log('🔑 測試 API Key:', apiKey.substring(0, 10) + '...');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    const text = response.text();

    console.log('✅ API Key 有效！');
    console.log('📝 Gemini 回應:', text);
    process.exit(0);
  } catch (error) {
    console.error('❌ API Key 測試失敗:', error.message);
    process.exit(1);
  }
}

testGemini();
