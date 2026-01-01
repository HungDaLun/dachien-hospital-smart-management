'use client';

import { createDepartment } from '../actions';
import { Button } from '@/components/ui';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? '建立中...' : '新增部門'}
        </Button>
    );
}

export default function CreateDepartmentForm() {
    const handleSubmit = async (formData: FormData) => {
        await createDepartment(formData);
    };

    return (
        <form action={handleSubmit} className="flex gap-2">
            <input
                name="name"
                placeholder="新部門名稱"
                className="border rounded px-3 py-2 text-sm"
                required
            />
            <input
                name="description"
                placeholder="描述 (選填)"
                className="border rounded px-3 py-2 text-sm"
            />
            <SubmitButton />
        </form>
    );
}
