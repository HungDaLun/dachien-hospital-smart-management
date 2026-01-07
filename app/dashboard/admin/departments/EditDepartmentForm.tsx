'use client';

/**
 * 編輯部門表單元件
 * 使用 Modal 方式編輯部門資訊
 */
import { useState } from 'react';
import { updateDepartment } from '../actions';
import { Button, Input } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { X, Save, AlertTriangle } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
}

interface EditDepartmentFormProps {
    department: Department;
    dict: Dictionary;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function EditDepartmentForm({ department, dict, onClose, onSuccess }: EditDepartmentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCodeWarning, setShowCodeWarning] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const newCode = formData.get('code') as string;
        
        // 如果代碼有變更，顯示警告
        if (newCode && newCode !== (department.code || '')) {
            setPendingFormData(formData);
            setShowCodeWarning(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await updateDepartment(department.id, formData);
            
            if (result.error) {
                setError(typeof result.error === 'string' ? result.error : '更新失敗');
            } else {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新失敗');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmCodeChange = async () => {
        if (!pendingFormData) return;
        
        setShowCodeWarning(false);
        setIsSubmitting(true);
        setError(null);
        
        try {
            const result = await updateDepartment(department.id, pendingFormData);
            
            if (result.error) {
                setError(typeof result.error === 'string' ? result.error : '更新失敗');
            } else {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新失敗');
        } finally {
            setIsSubmitting(false);
            setPendingFormData(null);
        }
    };

    if (showCodeWarning) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-semantic-warning/10 flex items-center justify-center text-semantic-warning">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                            變更部門代碼警告
                        </h3>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        變更部門代碼可能會影響以下功能：
                        <ul className="list-disc list-inside mt-2 space-y-1 text-text-tertiary">
                            <li>已存在的檔案命名規則（如：{department.code || 'OLD'}-xxx.pdf）</li>
                            <li>檔案搜尋功能可能無法找到舊代碼的檔案</li>
                        </ul>
                    </p>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowCodeWarning(false);
                                    setPendingFormData(null);
                                }}
                                className="flex-1"
                            >
                                {dict.common.cancel}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleConfirmCodeChange}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? dict.common.loading : dict.common.confirm}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                        編輯部門
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">
                            {dict.admin.departments.dept_name}
                        </label>
                        <Input
                            name="name"
                            defaultValue={department.name}
                            required
                            className="bg-black/20 border-white/10"
                            placeholder={dict.admin.departments.dept_name}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">
                            {dict.admin.departments.dept_code}
                        </label>
                        <Input
                            name="code"
                            defaultValue={department.code || ''}
                            className="bg-black/20 border-white/10"
                            placeholder={dict.admin.departments.dept_code}
                        />
                        <p className="text-xs text-text-tertiary mt-1 opacity-70">
                            部門代碼用於檔案命名規則（如：LEGAL-xxx.pdf）
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">
                            {dict.admin.departments.description}
                        </label>
                        <textarea
                            name="description"
                            defaultValue={department.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all resize-none"
                            placeholder={dict.admin.departments.description}
                        />
                    </div>

                    {error && (
                        <div className="bg-semantic-danger/10 border border-semantic-danger/30 rounded-xl p-3">
                            <p className="text-sm text-semantic-danger">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            {dict.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            <Save size={16} className="mr-2" />
                            {isSubmitting ? dict.common.loading : dict.common.save}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
