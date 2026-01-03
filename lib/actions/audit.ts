'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE_AGENT'
    | 'UPDATE_AGENT'
    | 'DELETE_AGENT'
    | 'VIEW_FILE'              // 查看檔案（新增）
    | 'VIEW_FILE_METADATA'      // 查看檔案詳細資訊（新增）
    | 'DOWNLOAD_FILE'           // 下載檔案（新增）
    | 'UPLOAD_FILE'
    | 'UPDATE_FILE'             // 更新檔案（新增，區分於 DELETE）
    | 'DELETE_FILE'
    | 'AGENT_QUERY'             // Agent 查詢檔案（新增）
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'CREATE_DEPT'
    | 'UPDATE_DEPT'
    | 'DELETE_DEPT'
    | 'CREATE_CATEGORY'
    | 'UPDATE_CATEGORY'
    | 'DELETE_CATEGORY';

export type AuditResource = 'AGENT' | 'FILE' | 'USER' | 'DEPARTMENT' | 'CATEGORY' | 'AUTH';

interface LogAuditOptions {
    action: AuditAction;
    resourceType: AuditResource;
    resourceId?: string;
    details?: Record<string, any>;
}

/**
 * Log an audit action
 */
export async function logAudit(options: LogAuditOptions) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Anonymous actions not logged for now, or handle differently

        const headersList = headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: options.action,
            resource_type: options.resourceType,
            resource_id: options.resourceId,
            details: options.details,
            ip_address: ip,
            user_agent: userAgent
        });
    } catch (error) {
        // Fail silently to not block main flow, but log to server console
        console.error('Audit Log Error:', error);
    }
}
