'use client';

import { useState } from 'react';
import { Button, Modal } from '@/components/ui';

interface SkillImporterProps {
    onImportComplete?: (skillData: Record<string, unknown>) => void;
}

export default function SkillImporter({ onImportComplete }: SkillImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [importContent, setImportContent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        setIsImporting(true);
        setError(null);

        try {
            const response = await fetch('/api/agents/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ import_content: importContent }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Import failed');
            }

            setIsOpen(false);
            setImportContent('');
            if (onImportComplete) {
                onImportComplete(result.data);
            }
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
                📥 匯入 Skill (Claude/OpenAI)
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="匯入 Agent Skill"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            取消
                        </Button>
                        <Button
                            variant="cta"
                            onClick={handleImport}
                            loading={isImporting}
                            disabled={!importContent.trim()}
                        >
                            開始匯入
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                        <p className="font-bold mb-1">💡 支援格式：</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Claude `assistant.json` (Project Export)</li>
                            <li>OpenAI Assistant API JSON</li>
                            <li>EAKAP Standard Skill Format</li>
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            貼上 Skill 定義內容 (JSON)
                        </label>
                        <textarea
                            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder='{"name": "My Agent", "instructions": "..."}'
                            value={importContent}
                            onChange={(e) => setImportContent(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-error-50 text-error-600 p-3 rounded-md text-sm border border-error-200">
                            ❌ {error}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
