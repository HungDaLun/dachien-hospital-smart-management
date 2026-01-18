/**
 * 管理員工具：修復舊會議記錄的 metadata
 * GET /api/admin/fix-meeting-metadata
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. 找出所有舊的會議記錄檔案
        const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .ilike('filename', '會議記錄%.md');

        if (error) {
            console.error('[FixMeetingMetadata] Query error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({
                total: 0,
                processed: 0,
                details: [],
                message: '沒有找到需要處理的會議記錄檔案'
            });
        }

        const results = [];

        for (const file of files) {
            // 2. 嘗試解析目前的 metadata
            const metadata = file.metadata_analysis || {};

            // 如果已經處理過（有 type 欄位），則跳過
            if (metadata.type === 'meeting_minutes') {
                results.push({ id: file.id, status: 'skipped', filename: file.filename });
                continue;
            }

            // 3. 從 filename 或舊 metadata 推斷資訊
            // 假設 filename 格式: "會議記錄_標題_日期.md"
            // 嘗試提取標題
            let title = metadata.title;
            if (!title || title.startsWith('[會議記錄]')) {
                // 嘗試從 filename 解析: "會議記錄_2026新年..._2026-01-15.md"
                const match = file.filename.match(/會議記錄_(.+)_(\d{4}-\d{2}-\d{2})\.md/);
                if (match) {
                    title = match[1];
                }
            }

            // 4. 更新 metadata
            const newMetadata = {
                ...metadata,
                title: title || metadata.title || file.filename,
                type: "meeting_minutes",
                type_label: "會議記錄",
                category: "MANAGEMENT",
                department: "跨部門", // 舊資料預設為跨部門，因為很難回溯精確參與者
                audience: "management_team",
                sensitivity: "internal",
                language: "zh-TW",
                tags: ["會議記錄", "歷史歸檔", ...(metadata.tags || [])],
                last_updated: new Date().toISOString()
            };

            // 5. 寫回資料庫
            const { error: updateError } = await supabase
                .from('files')
                .update({ metadata_analysis: newMetadata })
                .eq('id', file.id);

            if (updateError) {
                results.push({ id: file.id, status: 'error', error: updateError.message });
            } else {
                results.push({ id: file.id, status: 'updated', new_title: newMetadata.title });
            }
        }

        return NextResponse.json({
            total: files.length,
            processed: results.length,
            details: results
        });
    } catch (error) {
        console.error('[FixMeetingMetadata] Unexpected error:', error);
        return NextResponse.json(
            { error: '處理會議記錄 metadata 時發生錯誤' },
            { status: 500 }
        );
    }
}
