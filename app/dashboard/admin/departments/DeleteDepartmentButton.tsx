'use client';

import { deleteDepartment } from '../actions';
import { Button } from '@/components/ui';
import { useFormStatus } from 'react-dom';
import { Dictionary } from '@/lib/i18n/dictionaries';

function DeleteButton({ dict }: { dict: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            type="submit"
            disabled={pending}
        >
            {pending ? '...' : dict.common.delete}
        </Button>
    );
}

export default function DeleteDepartmentButton({ id, dict }: { id: string; dict: Dictionary }) {
    const handleDelete = async () => {
        await deleteDepartment(id);
    };

    return (
        <form action={handleDelete}>
            <DeleteButton dict={dict} />
        </form>
    );
}
