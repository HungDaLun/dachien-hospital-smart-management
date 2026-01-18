/**
 * Super Assistant - Unified Message Gateway
 * 統一訊息閘道：處理來自不同來源 (Line, Web, Voice) 的訊息
 */

// ==================== Types ====================

/**
 * 訊息來源類型
 */
export type MessageSource = 'line' | 'web' | 'voice';

/**
 * 統一訊息格式
 */
export interface UnifiedMessage {
    // 訊息識別
    id: string;
    source: MessageSource;
    timestamp: Date;

    // 使用者資訊
    userId?: string; // 系統使用者 ID (如已綁定)
    externalUserId: string; // 外部平台使用者 ID (如 Line User ID)

    // 訊息內容
    content: {
        type: 'text' | 'image' | 'audio' | 'postback';
        text?: string;
        mediaUrl?: string;
        postbackData?: string;
    };

    // 回應控制
    replyContext?: {
        replyToken?: string; // Line reply token
        sessionId?: string; // Web/Voice session ID
    };

    // 元數據
    metadata?: Record<string, unknown>;
}

/**
 * 統一回應格式
 */
export interface UnifiedResponse {
    // 回應內容
    content: {
        type: 'text' | 'template' | 'flex';
        text?: string;
        template?: unknown; // Line Template Message
        flex?: unknown; // Line Flex Message
    };

    // 建議動作
    suggestedActions?: Array<{
        label: string;
        data: string;
    }>;

    // 元數據
    metadata?: {
        confidence?: number;
        sources?: string[];
    };
}

// ==================== Gateway Class ====================

/**
 * 統一訊息閘道
 * 負責接收、標準化訊息，並轉送給 Orchestrator
 */
export class UnifiedMessageGateway {
    /**
     * 處理來自 Line 的訊息
     */
    async processLineMessage(params: {
        lineUserId: string;
        systemUserId?: string;
        text: string;
        replyToken?: string;
    }): Promise<UnifiedMessage> {
        const message: UnifiedMessage = {
            id: crypto.randomUUID(),
            source: 'line',
            timestamp: new Date(),
            userId: params.systemUserId,
            externalUserId: params.lineUserId,
            content: {
                type: 'text',
                text: params.text,
            },
            replyContext: {
                replyToken: params.replyToken,
            },
        };

        return message;
    }

    /**
     * 處理來自 Web 介面的訊息
     */
    async processWebMessage(params: {
        userId: string;
        text: string;
        sessionId: string;
    }): Promise<UnifiedMessage> {
        const message: UnifiedMessage = {
            id: crypto.randomUUID(),
            source: 'web',
            timestamp: new Date(),
            userId: params.userId,
            externalUserId: params.userId,
            content: {
                type: 'text',
                text: params.text,
            },
            replyContext: {
                sessionId: params.sessionId,
            },
        };

        return message;
    }

    /**
     * 處理來自語音介面的訊息 (預留)
     */
    async processVoiceMessage(params: {
        userId: string;
        transcribedText: string;
        sessionId: string;
        audioMetadata?: {
            duration: number;
            confidence: number;
        };
    }): Promise<UnifiedMessage> {
        const message: UnifiedMessage = {
            id: crypto.randomUUID(),
            source: 'voice',
            timestamp: new Date(),
            userId: params.userId,
            externalUserId: params.userId,
            content: {
                type: 'text',
                text: params.transcribedText,
            },
            replyContext: {
                sessionId: params.sessionId,
            },
            metadata: {
                audio: params.audioMetadata,
            },
        };

        return message;
    }
}

// ==================== Singleton Instance ====================

let gatewayInstance: UnifiedMessageGateway | null = null;

export function getUnifiedGateway(): UnifiedMessageGateway {
    if (!gatewayInstance) {
        gatewayInstance = new UnifiedMessageGateway();
    }
    return gatewayInstance;
}
