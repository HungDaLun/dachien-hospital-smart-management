'use client';

import { createDepartment } from '../actions';
import { Button, Input } from '@/components/ui';
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
        <form action={handleSubmit} className="flex gap-2 items-center">
            <div className="w-48">
                <Input
                    name="name"
                    placeholder={dict.admin.departments.dept_name}
                    inputSize="sm"
                    required
                />
            </div>
            <div className="w-24">
                <Input
                    name="code"
                    placeholder={dict.admin.departments.dept_code}
                    inputSize="sm"
                    required
                />
            </div>
            <div className="w-64">
                <Input
                    name="description"
                    placeholder={dict.admin.departments.description}
                    inputSize="sm"
                />
            </div>
            <SubmitButton dict={dict} />
        </form>
    );
}
