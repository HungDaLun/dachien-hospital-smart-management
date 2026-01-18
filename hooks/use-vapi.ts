import { useEffect, useState, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';

// 請在 Vapi Dashboard 取得您的 Public Key 並設定到 .env.local
// NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key
// NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id

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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 使用 useRef 來保存 Vapi 實例，避免 SSR 問題
    const vapiRef = useRef<Vapi | null>(null);
    const isInitializedRef = useRef(false);

    // 初始化 Vapi 實例
    useEffect(() => {
        // 只在客戶端執行
        if (typeof window === 'undefined') return;

        // 避免重複初始化
        if (isInitializedRef.current) return;

        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

        if (!publicKey) {
            console.error('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY');
            setStatus(VapiStatus.ERROR);
            setErrorMessage('缺少 Vapi Public Key 設定');
            return;
        }

        console.log('[Vapi] Initializing with public key:', publicKey.substring(0, 8) + '...');

        // 建立 Vapi 實例
        const vapi = new Vapi(publicKey);
        vapiRef.current = vapi;
        isInitializedRef.current = true;

        // 事件監聽
        vapi.on('call-start', () => {
            console.log('[Vapi] Call started');
            setStatus(VapiStatus.CONNECTED);
            setIsSessionActive(true);
            setErrorMessage(null);
        });

        vapi.on('call-end', () => {
            console.log('[Vapi] Call ended');
            setStatus(VapiStatus.IDLE);
            setIsSessionActive(false);
            setVolumeLevel(0);
        });

        vapi.on('speech-start', () => {
            console.log('[Vapi] User speech started');
            setStatus(VapiStatus.LISTENING);
        });

        vapi.on('speech-end', () => {
            console.log('[Vapi] User speech ended');
            setStatus(VapiStatus.CONNECTED);
        });

        vapi.on('volume-level', (level: number) => {
            setVolumeLevel(level);
        });

        vapi.on('message', (message: { type: string; transcriptType?: string; transcript?: string }) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                console.log('[Vapi] User said:', message.transcript);
            }
        });

        vapi.on('error', (e: Error | { message?: string }) => {
            const errorMsg = e instanceof Error ? e.message : (e?.message || '未知錯誤');
            console.error('[Vapi] Error:', errorMsg);
            setStatus(VapiStatus.ERROR);
            setIsSessionActive(false);
            setErrorMessage(errorMsg);
        });

        // 清理函數
        return () => {
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
        };
    }, []);

    const startSession = useCallback(async (assistantId?: string) => {
        const vapi = vapiRef.current;

        if (!vapi) {
            console.error('[Vapi] Vapi instance not initialized');
            setStatus(VapiStatus.ERROR);
            setErrorMessage('Vapi 尚未初始化，請重新整理頁面');
            return;
        }

        try {
            setStatus(VapiStatus.CONNECTING);
            setErrorMessage(null);

            const targetAssistantId = assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

            console.log('[Vapi] Starting session with assistant:', targetAssistantId?.substring(0, 8) + '...');

            if (targetAssistantId) {
                // 使用 Dashboard 上設定的 Assistant
                await vapi.start(targetAssistantId);
            } else {
                // 沒有 Assistant ID，使用 inline 配置（備用方案）
                console.warn('[Vapi] No assistant ID, using inline config');
                await vapi.start({
                    model: {
                        provider: "openai",
                        model: "gpt-4o",
                        messages: [
                            {
                                role: "system",
                                content: "你是一個專業、親切的超級管家助理。請用繁體中文回應。你的名字是 Nexus。"
                            }
                        ]
                    },
                    voice: {
                        provider: "openai",
                        voiceId: "alloy",
                    },
                    transcriber: {
                        provider: "deepgram",
                        model: "nova-2",
                        language: "zh-TW"
                    }
                } as Parameters<typeof vapi.start>[0]);
            }

            console.log('[Vapi] Session started successfully');

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '啟動失敗';
            console.error('[Vapi] Failed to start session:', errorMsg);
            setStatus(VapiStatus.ERROR);
            setIsSessionActive(false);
            setErrorMessage(errorMsg);
        }
    }, []);

    const stopSession = useCallback(() => {
        const vapi = vapiRef.current;
        if (vapi) {
            console.log('[Vapi] Stopping session');
            vapi.stop();
        }
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
        errorMessage,
        startSession,
        stopSession,
        toggleSession,
    };
};
