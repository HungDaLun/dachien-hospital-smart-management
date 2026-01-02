/**
 * Google Gemini API 客戶端
 * 用於與 Gemini 模型互動，包含檔案上傳與對話功能
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * 重試配置
 * 遵循 EAKAP 錯誤處理規範
 */
const retryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [429, 500, 502, 503, 504] as const,
};

/**
 * 建立 Gemini 客戶端實例
 * 匯出供其他模組使用
 */
export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  // Debug: 檢查 API Key 是否存在
  console.log('[Gemini Client] API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

  if (!apiKey) {
    throw new Error('缺少 GEMINI_API_KEY 環境變數');
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * 上傳檔案至 Gemini File Storage
 * @param fileBuffer 檔案內容（Buffer）
 * @param mimeType MIME 類型
 * @param displayName 顯示名稱
 * @returns Gemini 檔案資訊
 */
export async function uploadFileToGemini(
  fileBuffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; name: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 GEMINI_API_KEY 環境變數');
  }

  const fileManager = new GoogleAIFileManager(apiKey);

  // 建立暫存檔案
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `gemini-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  try {
    await fs.promises.writeFile(tempFilePath, fileBuffer);

    // 上傳至 Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType,
      displayName,
    });

    return {
      uri: uploadResult.file.uri,
      name: uploadResult.file.name,
    };
  } finally {
    // 刪除暫存檔案
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch(console.error);
    }
  }
}


/**
 * 刪除 Gemini 上的檔案
 * @param uri 檔案 URI (例如: https://generativelanguage.googleapis.com/v1beta/files/...)
 */
export async function deleteFileFromGemini(uri: string): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 GEMINI_API_KEY 環境變數');
  }

  // 從 URI 提取檔案名稱 (name)
  // URI 格式通常為: https://generativelanguage.googleapis.com/v1beta/files/NAME
  const fileName = uri.split('/').pop();
  if (!fileName) {
    console.warn('無法從 URI 解析檔案名稱:', uri);
    return;
  }

  // 完整 name 格式通常為 files/NAME，但 API 可能只需要 NAME 或 files/NAME
  // GoogleAIFileManager deleteFile 接收 `name` (e.g. "files/abc-123")

  // 如果 uri 是完整的 URL，我們嘗試提取 'files/...' 部分
  // 假設標準格式
  let name = `files/${fileName}`;

  const fileManager = new GoogleAIFileManager(apiKey);

  try {
    await fileManager.deleteFile(name);
  } catch (error) {
    console.error('Gemini 檔案刪除失敗:', error);
    // 不拋出錯誤，避免阻斷後續流程
  }
}

/**
 * 使用 Gemini 模型進行對話
 * @param modelVersion 模型版本（如 'gemini-3-flash'）
 * @param systemPrompt 系統提示詞
 * @param userMessage 使用者訊息
 * @param fileData 相關檔案資料列表（uri 與 mimeType）
 * @returns AI 回應（Streaming）
 */
export async function chatWithGemini(
  modelVersion: string,
  systemPrompt: string,
  userMessage: string,
  fileData: Array<{ uri: string; mimeType: string }> = [],
  history: Array<{ role: string; content: string }> = []
): Promise<ReadableStream<Uint8Array>> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({
    model: modelVersion || 'gemini-3-flash',
    systemInstruction: systemPrompt,
  });

  // 建構對話 Session 並包含歷史
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  // 建構當前請求內容
  const parts = [];

  // 加入檔案 (如果有的話)
  for (const file of fileData) {
    parts.push({
      fileData: {
        fileUri: file.uri,
        mimeType: file.mimeType,
      },
    });
  }

  // 加入使用者訊息
  parts.push({ text: userMessage });

  // 開始串流
  const result = await chat.sendMessageStream(parts);

  // 轉換為 ReadableStream
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * 產生內容 (非串流)
 * 用於 AI Librarian 等後台任務
 */
export async function generateContent(
  modelName: string,
  prompt: string,
  fileUri?: string,
  mimeType?: string
): Promise<string> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ model: modelName });

  const parts: any[] = [];
  if (fileUri && mimeType) {
    parts.push({
      fileData: {
        fileUri: fileUri,
        mimeType: mimeType,
      },
    });
  }
  parts.push({ text: prompt });

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}


/**
 * 重試機制輔助函式
 * 匯出供其他模組使用
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = retryConfig.maxRetries
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (retries <= 0) {
      throw error;
    }

    // 檢查是否為可重試的錯誤
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode && !retryConfig.retryableErrors.includes(statusCode as any)) {
      throw error;
    }

    // 計算延遲時間（指數退避）
    const delay = Math.min(
      retryConfig.initialDelayMs * Math.pow(retryConfig.backoffMultiplier, retryConfig.maxRetries - retries),
      retryConfig.maxDelayMs
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1);
  }
}
