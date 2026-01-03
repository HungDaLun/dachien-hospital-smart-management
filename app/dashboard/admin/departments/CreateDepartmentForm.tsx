'use client';

import { createDepartment } from '../actions';
import { Button } from '@/components/ui';
import { useFormStatus } from 'react-dom';
import { Dictionary } from '@/lib/i18n/dictionaries';

function SubmitButton({ dict }: { dict: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? dict.common.loading : dict.admin.departments.create_dept}
        </Button>
    );
}

export default function CreateDepartmentForm({ dict }: { dict: Dictionary }) {
    const handleSubmit = async (formData: FormData) => {
        await createDepartment(formData);
    };

    return (
        <form action={handleSubmit} className="flex gap-2">
            <input
                name="name"
                placeholder={dict.admin.departments.dept_name}
                className="border rounded px-3 py-2 text-sm"
                required
            />
            <input
                name="code"
                placeholder={dict.admin.departments.dept_code}
                className="border rounded px-3 py-2 text-sm w-24"
                required
            />
            <input
                name="description"
                placeholder={dict.admin.departments.description}
                className="border rounded px-3 py-2 text-sm"
            />
            <SubmitButton dict={dict} />
        </form>
    );
}
