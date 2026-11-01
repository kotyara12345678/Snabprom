import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  endChatSession,
  resolveChatErrorMessage,
  sendChatMessage,
} from './api/chatApi';
import {
  GREETING_MESSAGE,
  MAX_CHAT_FILE_SIZE,
  type ChatMessage,
  type ChatTransportStatus,
} from './types';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSessionId(): string {
  const key = 'snabprom.chat.sessionId';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const fresh = createId();
  sessionStorage.setItem(key, fresh);
  return fresh;
}

export type ChatPhase = 'typing' | 'greeting' | 'active' | 'ended';

/**
 * Состояние диалога с AI-консультантом.
 *
 * Ответы приходят ТОЛЬКО из chatApi.sendChatMessage — хук никогда
 * не сочиняет текст ассистента. Ошибки транспорта превращаются в
 * системные сообщения со статусом 'error' и возможностью повторить.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatTransportStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const sessionIdRef = useRef(createSessionId());
  const abortRef = useRef<AbortController | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const greetedRef = useRef(false);

  const isAwaiting = status === 'connecting' || status === 'awaiting-reply';

  const phase: ChatPhase = useMemo(() => {
    if (status === 'ended') return 'ended';
    if (greetedRef.current || messages.length > 0) return 'active';
    return 'greeting';
  }, [status, messages.length]);

  /** Первое открытие — приветствие */
  const showGreeting = useCallback(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content: GREETING_MESSAGE,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    // Прокрутка к последнему сообщению после рендера
    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const pushUserMessage = useCallback(
    (content: string, attachment?: File | null): { pendingId: string } => {
      const pendingId = createId();
      appendMessage({
        id: pendingId,
        role: 'user',
        content,
        createdAt: Date.now(),
        status: 'sending',
        attachment: attachment
          ? { name: attachment.name, size: attachment.size, mimeType: attachment.type }
          : undefined,
      });
      return { pendingId };
    },
    [appendMessage],
  );

  const markDelivered = useCallback((pendingId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === pendingId ? { ...m, status: 'sent' as const } : m)),
    );
  }, []);

  const markFailed = useCallback((pendingId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === pendingId ? { ...m, status: 'error' as const } : m)),
    );
  }, []);

  /** Отправка сообщения пользователем (в т.ч. из быстрых вариантов) */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isAwaiting) return;

      const attachment = file;
      const { pendingId } = pushUserMessage(trimmed, attachment);
      setFile(null);
      setFileError(null);
      setStatus('awaiting-reply');

      try {
        const result = await sendChatMessage(
          { sessionId: sessionIdRef.current, content: trimmed, file: attachment },
          abortRef.current?.signal,
        );
        markDelivered(pendingId);
        appendMessage({
          id: createId(),
          role: 'assistant',
          content: result.reply.content,
          createdAt: Date.now(),
        });
        setStatus('idle');
      } catch (error) {
        markFailed(pendingId);
        appendMessage({
          id: createId(),
          role: 'system',
          content: resolveChatErrorMessage(error),
          createdAt: Date.now(),
          status: 'error',
        });
        setStatus('error');
      }
    },
    [appendMessage, file, isAwaiting, markDelivered, markFailed, pushUserMessage],
  );

  /** Повтор неуспешной отправки последнего сообщения */
  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === lastUser.id);
      return idx === -1 ? prev : prev.slice(0, idx);
    });
    void sendMessage(lastUser.content);
  }, [messages, sendMessage]);

  const attachFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (next.size > MAX_CHAT_FILE_SIZE) {
      setFile(null);
      setFileError(
        'Файл больше 10 МБ. Сократите объём или пришлите его на info@snabpromtechmontazh.kz',
      );
      return;
    }
    setFileError(null);
    setFile(next);
  }, []);

  /** Завершение диалога: уведомляем backend и очищаем локальную сессию */
  const endConversation = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    await endChatSession(sessionIdRef.current);
    sessionIdRef.current = createSessionId();
    setMessages([]);
    setStatus('ended');
  }, []);

  /** Начать новый диалог после завершения */
  const restartConversation = useCallback(() => {
    greetedRef.current = false;
    setStatus('idle');
    setMessages([]);
    showGreeting();
  }, [showGreeting]);

  const cancelPending = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
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
    cancelPending,
  };
}
