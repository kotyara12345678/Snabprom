import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessagesSquare, X, RotateCcw, Power } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { useChat } from '../useChat';
import { QUICK_REPLIES } from '../types';

/**
 * Плавающий виджет AI-консультанта.
 *
 * UI полностью готов к backend-интеграции: весь диалог проходит
 * через useChat -> chatApi, на клиенте нет ни одного заготовленного ответа.
 */
export function AIChatWidget() {
  const {
    messages,
    status,
    isAwaiting,
    phase,
    file,
    fileError,
    scrollAnchorRef,
    showGreeting,
    sendMessage,
    retryLast,
    attachFile,
    endConversation,
    restartConversation,
  } = useChat();

  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const openedOnceRef = useRef(false);

  // Первое открытие — приветственное сообщение
  useEffect(() => {
    if (open && !openedOnceRef.current) {
      openedOnceRef.current = true;
      showGreeting();
    }
  }, [open, showGreeting]);

  // Escape закрывает окно; фокус на поле ввода
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => {
      document.getElementById('ai-chat-input')?.focus();
    }, 350);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(timer);
    };
  }, [open]);

  const statusLine = (() => {
    if (status === 'ended') return 'Диалог завершён';
    if (status === 'error') return 'Нет связи с сервисом';
    if (isAwaiting) return 'Консультант печатает ответ…';
    return 'Консультант отдела продаж';
  })();

  const statusTone =
    status === 'error' ? 'bg-red-500' : status === 'ended' ? 'bg-steel-400' : 'bg-emerald-500';

  const showQuickReplies =
    phase === 'active' && messages.filter((m) => m.role === 'user').length === 0;

  return (
    <>
      {/* Плавающая кнопка */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open ? 'Закрыть консультанта' : 'Открыть консультанта по промышленным поставкам'
        }
        aria-expanded={open}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        className="fixed right-4 bottom-4 z-[60] flex size-14 items-center justify-center bg-graphite-900 text-white shadow-[0_12px_40px_rgba(8,9,11,0.35)] transition-colors hover:bg-copper-500 md:right-6 md:bottom-6 md:size-16"
      >
        <span className="absolute inset-0 border border-white/10" aria-hidden />
        {open ? (
          <X className="size-6" aria-hidden />
        ) : (
          <>
            <MessagesSquare className="size-6" aria-hidden />
            <span
              className="absolute top-2.5 right-2.5 size-2 rounded-full bg-copper-400 ring-2 ring-graphite-900"
              aria-hidden
            />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Консультант по промышленным поставкам"
            aria-modal="false"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 bottom-0 z-55 flex flex-col border border-steel-200 bg-white shadow-[0_24px_80px_rgba(8,9,11,0.35)] sm:inset-auto sm:right-6 sm:bottom-26 sm:z-[55] sm:h-[620px] sm:w-[416px] sm:max-h-[calc(100vh-160px)] md:right-8 md:bottom-28"
          >
            {/* Заголовок */}
            <header className="flex items-start justify-between gap-3 border-b border-graphite-700 bg-graphite-900 px-4 py-4 md:px-5">
              <div className="min-w-0">
                <p className="font-display text-[15px] leading-snug font-semibold text-white">
                  Консультант по промышленным поставкам
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-[12.5px] text-steel-400">
                  <span className={`size-1.5 rounded-full ${statusTone}`} aria-hidden />
                  {statusLine}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {phase === 'active' ? (
                  <button
                    type="button"
                    onClick={() => void endConversation()}
                    title="Завершить диалог"
                    aria-label="Завершить диалог"
                    className="flex size-8 items-center justify-center text-steel-400 transition-colors hover:text-white"
                  >
                    <Power className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Свернуть"
                  aria-label="Свернуть окно консультанта"
                  className="flex size-8 items-center justify-center text-steel-400 transition-colors hover:text-white"
                >
                  <X className="size-4.5" />
                </button>
              </div>
            </header>

            {/* История */}
            {phase === 'ended' ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex size-12 items-center justify-center border border-steel-200 bg-steel-50 text-steel-500">
                  <Power className="size-5" />
                </div>
                <p className="text-[15px] leading-relaxed text-steel-600">
                  Диалог завершён. История очищена — можно начать новый разговор или оставить
                  заявку.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={restartConversation}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-copper-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-copper-600"
                  >
                    <RotateCcw className="size-4" /> Начать новый диалог
                  </button>
                  <a
                    href="#request"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center border border-steel-300 px-5 text-sm font-semibold text-graphite-800 transition-colors hover:border-graphite-900"
                  >
                    Оставить заявку
                  </a>
                </div>
              </div>
            ) : (
              <>
                <MessageList
                  messages={messages}
                  isAwaiting={isAwaiting}
                  scrollAnchorRef={scrollAnchorRef}
                  onRetry={retryLast}
                  onQuickReply={(text) => void sendMessage(text)}
                  showQuickReplies={showQuickReplies}
                  quickReplies={QUICK_REPLIES}
                />
                <ChatInput
                  disabled={isAwaiting}
                  file={file}
                  fileError={fileError}
                  onAttach={attachFile}
                  onSend={(text) => void sendMessage(text)}
                />
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
