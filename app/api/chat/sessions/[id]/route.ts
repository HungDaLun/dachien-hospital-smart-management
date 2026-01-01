/**
 * 單一對話 Session API
 * 取得對話歷史
 * 遵循 EAKAP API 規範
 */
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, NotFoundError, toApiResponse } from '@/lib/errors';

/**
 * GET /api/chat/sessions/:id
 * 取得對話歷史
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 查詢 Session
        const { data: session, error: sessionError } = await supabase
            .from('chat_sessions')
            .select(`
        *,
        agents (
          id,
          name,
          avatar_url,
          system_prompt
        )
      `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (sessionError || !session) {
            throw new NotFoundError('對話');
        }

        // 查詢訊息
        const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', id)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('查詢訊息失敗:', messagesError);
        }

        return NextResponse.json({
            success: true,
            data: {
                ...session,
                messages: messages || [],
            },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}

/**
 * DELETE /api/chat/sessions/:id
 * 刪除對話 Session
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 驗證使用者身份
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 確認 Session 存在且屬於使用者
        const { data: session } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!session) {
            throw new NotFoundError('對話');
        }

        // 1. 先取得所有相關的訊息 ID
        const { data: messages } = await supabase
            .from('chat_messages')
            .select('id')
            .eq('session_id', id);

        const messageIds = messages?.map(m => m.id) || [];

        // 2. 刪除所有相關的對話回饋（chat_feedback）
        if (messageIds.length > 0) {
            await supabase
                .from('chat_feedback')
                .delete()
                .in('message_id', messageIds);
        }

        // 3. 刪除所有相關的對話訊息（chat_messages）
        await supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', id);

        // 4. 最後刪除 Session 本身
        const { error: deleteError } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('刪除 Session 失敗:', deleteError);
            return NextResponse.json(
                { success: false, error: { code: 'DELETE_ERROR', message: '刪除對話失敗' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { id, deleted: true },
        });

    } catch (error) {
        return toApiResponse(error);
    }
}
