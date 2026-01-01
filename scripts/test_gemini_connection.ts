
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../lib/gemini/client';

async function testConnection() {
    console.log('Testing Gemini Connection...');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is missing');
        return;
    }

    try {
        const genAI = createGeminiClient();

        const modelsToTest = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

        for (const modelName of modelsToTest) {
            try {
                console.log(`--- Testing model: ${modelName} ---`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('hi');
                const response = await result.response;
                console.log(`✅ ${modelName} Response:`, response.text());
            } catch (e: any) {
                console.error(`❌ ${modelName} Failed:`, e.message);
            }
        }
        console.log('Testing Finished.');
    } catch (error: any) {
        console.error('Gemini Connection: FAILED');
        console.error('Error details:', error.message);
    }
}

testConnection();
