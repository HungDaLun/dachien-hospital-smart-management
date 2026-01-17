/**
 * 對話回饋 API 端點
 * POST /api/chat/feedback
 * 記錄使用者對對話訊息的回饋
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ValidationError, toApiResponse } from '@/lib/errors';
import { getCurrentUserProfile } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 取得使用者資料
    const profile = await getCurrentUserProfile();

    const body = await request.json();
    const { message_id, rating, reason_code, comment } = body;

    // 驗證必填欄位
    if (!message_id) {
      throw new ValidationError('請提供訊息 ID');
    }

    if (!rating || (rating !== 1 && rating !== -1)) {
      throw new ValidationError('請提供有效的評分（1 或 -1）');
    }

    // 如果是負評，建議提供原因
    if (rating === -1 && !reason_code && !comment) {
      throw new ValidationError('負評請提供原因或意見');
    }

    // 驗證訊息是否存在且屬於當前使用者
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('id, session_id, chat_sessions!inner(user_id), citations')
      .eq('id', message_id)
      .single();

    if (messageError || !message) {
      throw new ValidationError('找不到指定的訊息');
    }

    // 檢查訊息是否屬於當前使用者的 Session
    const sessionData = message.chat_sessions;
    const session = (Array.isArray(sessionData) ? sessionData[0] : sessionData) as unknown as { user_id: string };

    if (!session || session.user_id !== profile.id) {
      throw new ValidationError('您只能對自己的對話訊息提供回饋');
    }

    // 檢查是否已經有回饋（同一使用者對同一訊息只能回饋一次）
    const { data: existingFeedback } = await supabase
      .from('chat_feedback')
      .select('id')
      .eq('message_id', message_id)
      .eq('user_id', profile.id)
      .single();

    let feedbackId: string;

    if (existingFeedback) {
      // 更新現有回饋
      const { data: updatedFeedback, error: updateError } = await supabase
        .from('chat_feedback')
        .update({
          rating,
          reason_code: reason_code || null,
          comment: comment || null,
        })
        .eq('id', existingFeedback.id)
        .select()
        .single();

      if (updateError) {
        throw new ValidationError('更新回饋失敗');
      }

      feedbackId = updatedFeedback.id;
    } else {
      // 建立新回饋
      const { data: newFeedback, error: insertError } = await supabase
        .from('chat_feedback')
        .insert({
          message_id,
          user_id: profile.id,
          rating,
          reason_code: reason_code || null,
          comment: comment || null,
        })
        .select()
        .single();

      if (insertError) {
        throw new ValidationError('儲存回饋失敗');
      }

      feedbackId = newFeedback.id;

      // 如果是正向回饋，且訊息有引用來源，則同步更新引用來源的評分 (Implicit Feedback to Knowledge)
      if (rating === 1 && message.citations) {
        interface Citation {
          file_id?: string;
          uri?: string;
        }
        const citations = message.citations as Citation[];
        if (Array.isArray(citations) && citations.length > 0) {
          // Import dynamically to avoid circle dependency issues if any
          const { submitFeedback } = await import('@/lib/knowledge/feedback');

          // 非同步處理，不阻擋 API 回應
          Promise.all(citations.map(async (citation) => {
            // Find file ID from citation URI or other metadata if available.
            // Assuming citation.uri is the file path or ID. 
            // In real implementation, we might need a lookup map or store file_id in citation.
            // For now, let's assume we can't easily link back without file_id in citation.
            // But wait, the citation object usually has metadata.
            // If we implemented Gemini Grounding, the URI might be a Google Storage URI.
            // We need to map it back to our local file ID.
            // This part might be tricky without a direct link.

            // If we stored 'file_id' in citation during generation (which we didn't explicitly yet, likely just whatever Gemini gave),
            // we might skip this for now unless we are sure.

            // HOWEVER, let's assume for this P1 task that if we have a valid file_id, we use it.
            if (citation.file_id) {
              return submitFeedback({
                file_id: citation.file_id,
                source: 'user_explicit', // Via chat feedback
                feedback_type: 'helpful',
                score: 1.0,
                user_id: profile.id,
                details: { message_id, reason: 'chat_positive_feedback' }
              }).catch(e => console.error('Error syncing file feedback:', e));
            }
          }));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: feedbackId,
        message: '回饋已記錄，感謝您的意見！',
      },
    }, { status: existingFeedback ? 200 : 201 });

  } catch (error) {
    return toApiResponse(error);
  }
}
