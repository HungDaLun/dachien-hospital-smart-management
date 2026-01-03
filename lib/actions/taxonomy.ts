'use server';

import { createClient } from '@/lib/supabase/server';
import { DocumentCategory } from '@/types';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/actions/audit';

/**
 * Get all categories
 */
export async function getCategories(): Promise<{ success: boolean; data?: DocumentCategory[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('document_categories')
            .select('*')
            .order('name');

        if (error) throw error;

        return { success: true, data: data as DocumentCategory[] };
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new category
 */
export async function createCategory(
    name: string,
    parentId: string | null = null,
    description: string | null = null
): Promise<{ success: boolean; data?: DocumentCategory; error?: string }> {
    try {
        const supabase = await createClient();

        // Check permission (optional: server action already has RLS but explicit check is good)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // We rely on RLS for role checks, but checking here saves a DB call if no user

        const { data, error } = await supabase
            .from('document_categories')
            .insert({
                name,
                parent_id: parentId, // Ensure null if empty string
                description
            })
            .select()
            .single();

        if (error) throw error;

        await logAudit({
            action: 'CREATE_CATEGORY',
            resourceType: 'CATEGORY',
            resourceId: data.id,
            details: { name, parentId }
        });

        revalidatePath('/dashboard/admin/taxonomy');
        return { success: true, data: data as DocumentCategory };
    } catch (error: any) {
        console.error('Error creating category:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a category
 */
export async function updateCategory(
    id: string,
    data: { name?: string; parentId?: string | null; description?: string | null }
): Promise<{ success: boolean; data?: DocumentCategory; error?: string }> {
    try {
        const supabase = await createClient();

        const updatePayload: any = {};
        if (data.name !== undefined) updatePayload.name = data.name;
        if (data.parentId !== undefined) updatePayload.parent_id = data.parentId;
        if (data.description !== undefined) updatePayload.description = data.description;

        const { data: updatedCategory, error } = await supabase
            .from('document_categories')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logAudit({
            action: 'UPDATE_CATEGORY',
            resourceType: 'CATEGORY',
            resourceId: id,
            details: data
        });

        revalidatePath('/dashboard/admin/taxonomy');
        return { success: true, data: updatedCategory as DocumentCategory };
    } catch (error: any) {
        console.error('Error updating category:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('document_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await logAudit({
            action: 'DELETE_CATEGORY',
            resourceType: 'CATEGORY',
            resourceId: id
        });

        revalidatePath('/dashboard/admin/taxonomy');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<{ success: boolean; data?: { id: string; name: string; code: string | null }[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('departments')
            .select('id, name, code')
            .order('name');

        if (error) throw error;

        return { success: true, data: data };
    } catch (error: any) {
        console.error('Error fetching departments:', error);
        return { success: false, error: error.message };
    }
}
