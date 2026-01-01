'use client';

import { deleteDepartment } from '../actions';
import { Button } from '@/components/ui';
import { useFormStatus } from 'react-dom';

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            type="submit"
            disabled={pending}
        >
            {pending ? '...' : '刪除'}
        </Button>
    );
}

export default function DeleteDepartmentButton({ id }: { id: string }) {
    const handleDelete = async () => {
        await deleteDepartment(id);
    };

    return (
        <form action={handleDelete}>
            <DeleteButton />
        </form>
    );
}
