'use client';

/**
 * 對話回饋元件
 * 提供 👍/👎 按鈕與回饋表單
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
import { useState } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { ThumbsUp, ThumbsDown, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface ChatFeedbackProps {
  messageId: string;
  onFeedbackSubmitted?: () => void;
  dict: Dictionary;
}

export default function ChatFeedback({ messageId, onFeedbackSubmitted, dict }: ChatFeedbackProps) {
  const FEEDBACK_REASONS = [
    { code: 'irrelevant', label: dict.chat.feedback.reason_irrelevant },
    { code: 'incorrect', label: dict.chat.feedback.reason_incorrect },
    { code: 'outdated', label: dict.chat.feedback.reason_outdated },
    { code: 'other', label: dict.chat.feedback.reason_other },
  ];

  const { toast } = useToast();

  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reasonCode, setReasonCode] = useState<string>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePositiveFeedback = async () => {
    if (rating === 1) return;

    setLoading(true);
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, rating: 1 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || '提交回饋失敗');
      setRating(1);
      setSubmitted(true);
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('提交回饋失敗:', error);
      toast.error(error instanceof Error ? error.message : '提交回饋失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleNegativeFeedback = () => {
    if (rating === -1) {
      setShowForm(!showForm);
    } else {
      setRating(-1);
      setShowForm(true);
    }
  };

  const handleSubmitNegativeFeedback = async () => {
    if (!reasonCode && !comment.trim()) {
      toast.error(dict.chat.feedback.select_reason);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          rating: -1,
          reason_code: reasonCode || null,
          comment: comment.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || '提交回饋失敗');
      setSubmitted(true);
      setShowForm(false);
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('提交回饋失敗:', error);
      toast.error(error instanceof Error ? error.message : '提交回饋失敗');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-semantic-success uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
        <CheckCircle2 size={12} />
        {rating === 1 ? dict.chat.feedback.success : dict.chat.feedback.success_negative}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Feedback buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePositiveFeedback}
          disabled={loading || submitted}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
            ${rating === 1
              ? 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30 shadow-glow-green/10'
              : 'bg-white/5 text-text-tertiary border border-white/5 hover:bg-white/10 hover:border-white/20'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          <ThumbsUp size={12} className={rating === 1 ? 'animate-bounce' : ''} />
          <span>{dict.chat.feedback.helpful}</span>
        </button>

        <button
          onClick={handleNegativeFeedback}
          disabled={loading || (submitted && rating !== -1)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
            ${rating === -1
              ? 'bg-semantic-danger/20 text-semantic-danger border border-semantic-danger/30 shadow-glow-red/10'
              : 'bg-white/5 text-text-tertiary border border-white/5 hover:bg-white/10 hover:border-white/20'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          <ThumbsDown size={12} className={rating === -1 ? 'animate-shake' : ''} />
          <span>{dict.chat.feedback.not_helpful}</span>
        </button>
      </div>

      {/* Negative Feedback Form */}
      {showForm && rating === -1 && !submitted && (
        <div className="mt-4 p-5 bg-background-secondary/80 border border-white/10 rounded-[28px] shadow-floating animate-in slide-in-from-top-2 duration-300 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-secondary-400" />
              <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                {dict.chat.feedback.title}
              </h4>
            </div>
            <button onClick={() => setShowForm(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Reasons */}
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_REASONS.map((reason) => (
                <button
                  key={reason.code}
                  onClick={() => setReasonCode(reason.code)}
                  className={`
                    px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all
                    ${reasonCode === reason.code
                      ? 'bg-primary-500 text-black border-primary-500 shadow-glow-cyan/20'
                      : 'bg-white/5 text-text-tertiary border-white/5 hover:bg-white/10 hover:border-white/10'
                    }
                  `}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={dict.chat.feedback.comment_placeholder}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-text-secondary focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 outline-none transition-all placeholder:text-text-tertiary/20 resize-none"
              rows={3}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitNegativeFeedback}
                disabled={loading}
                variant="primary"
                size="sm"
                className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest rounded-xl"
              >
                {loading ? <Spinner size="sm" color="black" /> : dict.chat.feedback.submit}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setRating(null);
                  setReasonCode('');
                  setComment('');
                }}
                disabled={loading}
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest"
              >
                {dict.chat.feedback.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
