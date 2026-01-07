'use client';

/**
 * 編輯部門按鈕元件
 * 點擊後開啟編輯表單 Modal
 */
import { useState } from 'react';
import { Button } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Pencil } from 'lucide-react';
import EditDepartmentForm from './EditDepartmentForm';
import { useRouter } from 'next/navigation';

interface Department {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
}

interface EditDepartmentButtonProps {
    department: Department;
    dict: Dictionary;
}

export default function EditDepartmentButton({ department, dict }: EditDepartmentButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh(); // 重新載入頁面以顯示更新後的資料
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-text-secondary hover:text-text-primary hover:bg-white/5"
            >
                <Pencil size={14} className="mr-2" />
                {dict.common.edit}
            </Button>

            {isOpen && (
                <EditDepartmentForm
                    department={department}
                    dict={dict}
                    onClose={() => setIsOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
