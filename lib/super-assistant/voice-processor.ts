/**
 * 語音處理器 (Voice Processor)
 * 整合 OpenAI Whisper (STT) 與 TTS
 */

import { getSystemSetting } from '@/lib/supabase/settings';

// ==================== Types ====================

export interface VoiceProcessorResult {
    text: string;
    confidence: number;
}

// ==================== Voice Processor ====================

export class VoiceProcessor {
    /**
     * 語音轉文字 (STT)
     * 預設使用 OpenAI Whisper via API
     */
    async speechToText(audioBlob: Blob): Promise<VoiceProcessorResult> {
        try {
            const apiKey = await getSystemSetting('openai_api_key', 'OPENAI_API_KEY');
            if (!apiKey) throw new Error('OpenAI API Key not configured');

            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Whisper API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                text: data.text,
                confidence: 1.0, // Whisper doesn't always provide confidence per word in standard API
            };
        } catch (error) {
            console.error('[VoiceProcessor] STT Error:', error);
            throw error;
        }
    }

    /**
     * 文字轉語音 (TTS)
     * 預設使用 OpenAI TTS
     */
    async textToSpeech(text: string): Promise<ArrayBuffer> {
        try {
            const apiKey = await getSystemSetting('openai_api_key', 'OPENAI_API_KEY');
            if (!apiKey) throw new Error('OpenAI API Key not configured');

            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: 'alloy', // 專業助理音感
                }),
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error('[VoiceProcessor] TTS Error:', error);
            throw error;
        }
    }
}

// ==================== Singleton ====================

let voiceProcessorInstance: VoiceProcessor | null = null;

export function getVoiceProcessor(): VoiceProcessor {
    if (!voiceProcessorInstance) {
        voiceProcessorInstance = new VoiceProcessor();
    }
    return voiceProcessorInstance;
}
