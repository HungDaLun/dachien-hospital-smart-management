import { useEffect, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

// 請在 Vapi Dashboard 取得您的 Public Key 並設定到 .env.local
// NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key
// NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id (可選，若要在切換不同助理時使用)

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');

export enum VapiStatus {
    LOADING = 'loading',
    IDLE = 'idle',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    SPEAKING = 'speaking',
    LISTENING = 'listening',
    ERROR = 'error',
}

export const useVapi = () => {
    const [status, setStatus] = useState<VapiStatus>(VapiStatus.IDLE);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
            console.error('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY');
            setStatus(VapiStatus.ERROR);
            return;
        }

        // 事件監聽
        vapi.on('call-start', () => {
            setStatus(VapiStatus.CONNECTED);
            setIsSessionActive(true);
        });

        vapi.on('call-end', () => {
            setStatus(VapiStatus.IDLE);
            setIsSessionActive(false);
            setVolumeLevel(0);
        });

        vapi.on('speech-start', () => {
            setStatus(VapiStatus.LISTENING);
        });

        vapi.on('speech-end', () => {
            setStatus(VapiStatus.CONNECTED); // 回到已連線狀態，等待 AI 回應
        });

        vapi.on('volume-level', (level) => {
            setVolumeLevel(level);
            // 如果正在說話且音量大於某個值，可以視為 speaking
            if (level > 0.1 && status === VapiStatus.CONNECTED) {
                // 這裡可以做更細緻的狀態判斷
            }
        });

        vapi.on('message', (message) => {
            // 處理自定義訊息或轉錄內容
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                console.log('User said:', message.transcript);
            }
        });

        vapi.on('error', (e) => {
            console.error('Vapi error:', e);
            setStatus(VapiStatus.ERROR);
            setIsSessionActive(false);
        });

        return () => {
            // 清理監聽器 (Vapi SDK 目前似乎沒有 removeAllListeners，這裡僅做參考)
        };
    }, []);

    const startDetail = {
        model: {
            provider: "openai",
            model: "gpt-4o",
            systemPrompt: "你是一個專業、親切的超級管家助理。請用繁體中文回應。你的名字是 Nexus。",
        },
        voice: {
            provider: "11labs",
            voiceId: "cjVigY5qzO86Huf0OWal", // Eric - 穩重男聲，可換
        },
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "zh-TW" // 設定中文辨識
        }
    };

    const startSession = useCallback(async (assistantId?: string) => {
        try {
            setStatus(VapiStatus.CONNECTING);

            // 如果有指定 Assistant ID (在 Vapi Dashboard 設定好的)
            if (assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
                await vapi.start(assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
            } else {
                // 或者直接用程式碼定義配置 (不推薦生產環境，建議用 Dashboard 管理)
                await vapi.start(startDetail);
            }

        } catch (e) {
            console.error('Failed to start Vapi session:', e);
            setStatus(VapiStatus.ERROR);
            setIsSessionActive(false);
        }
    }, []);

    const stopSession = useCallback(() => {
        vapi.stop();
    }, []);

    const toggleSession = useCallback(() => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    }, [isSessionActive, startSession, stopSession]);

    return {
        status,
        isSessionActive,
        volumeLevel,
        startSession,
        stopSession,
        toggleSession,
    };
};
