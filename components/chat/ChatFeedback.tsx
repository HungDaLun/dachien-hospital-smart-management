'use client';

/**
 * 對話回饋元件
 * 提供 👍/👎 按鈕與回饋表單
 */
import { useState } from 'react';

interface ChatFeedbackProps {
  messageId: string;
  onFeedbackSubmitted?: () => void;
}

const FEEDBACK_REASONS = [
  { code: '答非所問', label: '答非所問' },
  { code: '資訊錯誤', label: '資訊錯誤' },
  { code: '來源過時', label: '來源過時' },
  { code: '其他', label: '其他' },
] as const;

export default function ChatFeedback({ messageId, onFeedbackSubmitted }: ChatFeedbackProps) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reasonCode, setReasonCode] = useState<string>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePositiveFeedback = async () => {
    if (rating === 1) return; // 已經點擊過

    setLoading(true);
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          rating: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '提交回饋失敗');
      }

      setRating(1);
      setSubmitted(true);
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('提交回饋失敗:', error);
      alert(error instanceof Error ? error.message : '提交回饋失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleNegativeFeedback = () => {
    if (rating === -1) {
      // 如果已經點擊過負評，顯示表單
      setShowForm(!showForm);
    } else {
      // 第一次點擊負評，顯示表單
      setRating(-1);
      setShowForm(true);
    }
  };

  const handleSubmitNegativeFeedback = async () => {
    if (!reasonCode && !comment.trim()) {
      alert('請選擇原因或填寫意見');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          rating: -1,
          reason_code: reasonCode || null,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '提交回饋失敗');
      }

      setSubmitted(true);
      setShowForm(false);
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('提交回饋失敗:', error);
      alert(error instanceof Error ? error.message : '提交回饋失敗');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && rating === 1) {
    return (
      <div className="mt-2 text-sm text-success-500">
        ✓ 感謝您的回饋！
      </div>
    );
  }

  if (submitted && rating === -1) {
    return (
      <div className="mt-2 text-sm text-success-500">
        ✓ 感謝您的意見，我們會持續改進！
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* 回饋按鈕 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePositiveFeedback}
          disabled={loading || submitted}
          className={`
            flex items-center gap-1 px-2 py-1 text-sm rounded
            transition-colors
            ${rating === 1
              ? 'bg-success-100 text-success-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span>👍</span>
          <span>有幫助</span>
        </button>

        <button
          onClick={handleNegativeFeedback}
          disabled={loading || (submitted && rating !== -1)}
          className={`
            flex items-center gap-1 px-2 py-1 text-sm rounded
            transition-colors
            ${rating === -1
              ? 'bg-error-100 text-error-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span>👎</span>
          <span>沒幫助</span>
        </button>
      </div>

      {/* 負評表單 */}
      {showForm && rating === -1 && !submitted && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            請告訴我們哪裡需要改進：
          </p>

          <div className="space-y-2">
            {/* 原因選項 */}
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_REASONS.map((reason) => (
                <button
                  key={reason.code}
                  onClick={() => setReasonCode(reason.code)}
                  className={`
                    px-3 py-1 text-xs rounded
                    transition-colors
                    ${reasonCode === reason.code
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {/* 自由文字 */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="請提供更多詳細意見（選填）"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
            />

            {/* 提交按鈕 */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitNegativeFeedback}
                disabled={loading}
                className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '提交中...' : '提交回饋'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setRating(null);
                  setReasonCode('');
                  setComment('');
                }}
                disabled={loading}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
