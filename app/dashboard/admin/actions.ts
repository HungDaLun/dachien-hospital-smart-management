'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema Validation
const DepartmentSchema = z.object({
    name: z.string().min(2, '部門名稱至少需要 2 個字'),
    description: z.string().optional(),
});

const UserUpdateSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(['SUPER_ADMIN', 'DEPT_ADMIN', 'EDITOR', 'USER']),
    departmentId: z.string().uuid().nullable(),
});

/**
 * 建立部門
 */
export async function createDepartment(formData: FormData) {
    const supabase = await createClient();

    // 權限檢查 (簡易版，建議搭配 Middleware 強化)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 解析資料
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
    };

    const validated = DepartmentSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { error } = await supabase
        .from('departments')
        .insert(validated.data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/departments');
    return { success: true };
}

/**
 * 更新部門
 */
export async function updateDepartment(id: string, formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
    };

    const validated = DepartmentSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { error } = await supabase
        .from('departments')
        .update(validated.data)
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/departments');
    return { success: true };
}

/**
 * 刪除部門
 */
export async function deleteDepartment(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/departments');
    return { success: true };
}

/**
 * 更新使用者角色與部門
 */
export async function updateUserProfile(userId: string, role: string, departmentId: string | null) {
    const supabase = await createClient();

    const validated = UserUpdateSchema.safeParse({ userId, role, departmentId });
    if (!validated.success) {
        return { error: 'Invalid data' };
    }

    const { error } = await supabase
        .from('user_profiles')
        .update({
            role: validated.data.role,
            department_id: validated.data.departmentId
        })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/users');
    return { success: true };
}
