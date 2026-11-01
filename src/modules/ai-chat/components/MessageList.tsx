import { formatFileSize } from '@/lib/validation';
import { ArrowRight } from '@/components/ui/Button';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isAwaiting: boolean;
  scrollAnchorRef: React.RefObject<HTMLDivElement | null>;
  onRetry: () => void;
  onQuickReply?: (text: string) => void;
  showQuickReplies?: boolean;
  quickReplies?: readonly string[];
}

function StatusDot({ status }: { status?: ChatMessage['status'] }) {
  if (status === 'sending') {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-steel-400">
        отправка…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
        не доставлено
      </span>
    );
  }
  return null;
}

export function MessageList({
  messages,
  isAwaiting,
  scrollAnchorRef,
  onRetry,
  onQuickReply,
  showQuickReplies,
  quickReplies = [],
}: MessageListProps) {
  return (
    <div
      className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-5"
      role="log"
      aria-live="polite"
      aria-label="История диалога с консультантом"
    >
      {messages.map((message) => {
        if (message.role === 'system') {
          return (
            <div
              key={message.id}
              className="border-l-2 border-copper-500 bg-copper-500/8 px-4 py-3 text-[14px] leading-relaxed text-graphite-800"
            >
              <p>{message.content}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-copper-600 underline-offset-2 hover:underline"
              >
                Повторить отправку <ArrowRight className="size-3.5" />
              </button>
            </div>
          );
        }

        const isUser = message.role === 'user';
        return (
          <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[86%] px-4 py-3 text-[14.5px] leading-relaxed ${
                isUser
                  ? 'bg-graphite-850 text-white'
                  : 'border border-steel-200 bg-steel-50 text-graphite-900'
              }`}
            >
              {message.attachment ? (
                <div
                  className={`mb-2 flex items-center gap-2 border px-3 py-2 text-[13px] ${
                    isUser ? 'border-white/25 text-steel-300' : 'border-steel-200 bg-white text-steel-600'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4 shrink-0">
                    <path d="M14 3v5h5M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9z" />
                  </svg>
                  <span className="truncate font-medium">{message.attachment.name}</span>
                  <span className="shrink-0 opacity-70">{formatFileSize(message.attachment.size)}</span>
                </div>
              ) : null}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div className={`mt-1 flex justify-end ${isUser ? '' : 'hidden'}`}>
                <StatusDot status={message.status} />
              </div>
            </div>
          </div>
        );
      })}

      {isAwaiting ? (
        <div className="flex justify-start">
          <div
            className="flex items-center gap-1.5 border border-steel-200 bg-steel-50 px-4 py-3.5"
            aria-label="Консультант печатает ответ"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-bounce rounded-full bg-steel-500"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {showQuickReplies && quickReplies.length > 0 && !isAwaiting ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onQuickReply?.(reply)}
              className="border border-steel-300 bg-white px-3.5 py-2 text-[13px] font-medium text-graphite-800 transition-colors hover:border-copper-500 hover:text-copper-600"
            >
              {reply}
            </button>
          ))}
        </div>
      ) : null}

      <div ref={scrollAnchorRef} />
    </div>
  );
}
