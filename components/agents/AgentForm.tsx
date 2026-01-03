/**
 * Agent 表單元件
 * 用於建立與編輯 Agent
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select, Modal } from '@/components/ui';
import type { AgentData } from './AgentCard';

/**
 * Agent 表單屬性
 */
interface AgentFormProps {
    isOpen: boolean;
    onClose: () => void;
    agent?: AgentData | null;
    onSuccess?: () => void;
}

/**
 * 模型版本選項
 */
const modelOptions = [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (快速，推薦)' },
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (最強大)' },
];

/**
 * Temperature 選項
 */
const temperatureOptions = [
    { value: '0.0', label: '0.0 - 精確' },
    { value: '0.3', label: '0.3 - 保守' },
    { value: '0.5', label: '0.5 - 平衡' },
    { value: '0.7', label: '0.7 - 創意（預設）' },
    { value: '1.0', label: '1.0 - 高度創意' },
];

export default function AgentForm({ isOpen, onClose, agent, onSuccess }: AgentFormProps) {
    const isEditing = !!agent;

    // 表單狀態
    const [name, setName] = useState(agent?.name || '');
    const [description, setDescription] = useState(agent?.description || '');
    const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt || '');
    const [modelVersion, setModelVersion] = useState(agent?.model_version || 'gemini-3-flash-preview');
    const [temperature, setTemperature] = useState(String(agent?.temperature || 0.7));

    // 載入狀態
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 重置表單
     */
    const resetForm = () => {
        setName('');
        setDescription('');
        setSystemPrompt('');
        setModelVersion('gemini-3-flash-preview');
        setTemperature('0.7');
        setError(null);
    };

    /**
     * 處理關閉
     */
    const handleClose = () => {
        resetForm();
        onClose();
    };

    /**
     * 處理提交
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證
        if (!name.trim()) {
            setError('請輸入 Agent 名稱');
            return;
        }
        if (!systemPrompt.trim()) {
            setError('請輸入 System Prompt');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                system_prompt: systemPrompt.trim(),
                model_version: modelVersion,
                temperature: parseFloat(temperature),
            };

            const url = isEditing ? `/api/agents/${agent.id}` : '/api/agents';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || '操作失敗');
            }

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生錯誤');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? '編輯 Agent' : '建立新 Agent'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 錯誤訊息 */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* 基本資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Agent 名稱"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例如：客服助理"
                        required
                        fullWidth
                    />

                    <Select
                        label="模型版本"
                        options={modelOptions}
                        value={modelVersion}
                        onChange={(e) => setModelVersion(e.target.value)}
                        fullWidth
                    />
                </div>

                {/* 描述 */}
                <Input
                    label="描述（選填）"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="簡短描述這個 Agent 的用途"
                    fullWidth
                />

                {/* System Prompt */}
                <Textarea
                    label="System Prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="輸入 Agent 的系統提示詞，定義其角色與行為..."
                    rows={8}
                    required
                    fullWidth
                    hint="定義 Agent 的角色、專業領域、回應風格等"
                />

                {/* 進階設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Temperature（創意程度）"
                        options={temperatureOptions}
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        fullWidth
                        hint="數值越高，回應越有創意"
                    />
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        取消
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isEditing ? '儲存變更' : '建立 Agent'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
