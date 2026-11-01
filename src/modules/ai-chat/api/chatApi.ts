import type { ChatRequest, ChatResponse, ChatEndResponse } from '../types';

/**
 * API-клиент AI-консультанта (FastAPI backend, ключ только на сервере).
 *
 * Контракт с backend:
 *
 *  1) POST {VITE_AI_CHAT_URL || '/api/chat'}
 *     Content-Type: multipart/form-data
 *     поля: sessionId (string), content (string), file? (файл ≤ 10 МБ)
 *     200 -> { sessionId, reply: { content: string } }
 *     4xx/5xx -> { message?: string }  -> показывается пользователю
 *
 *  2) POST {VITE_AI_CHAT_URL || '/api/chat'}/session  (JSON: { sessionId })
 *     200 -> { ok: true }   — завершение диалога и очистка контекста на сервере
 *
 * Клиент не содержит ни одного заранее заготовленного «ответа AI»:
 * при любой ошибке состояние диалога переходит в 'error' и показывается
 * честное сообщение о недоступности сервиса.
 */

const BASE_URL = import.meta.env.VITE_AI_CHAT_URL ?? '/api/chat';
// Модель с reasoning может отвечать долго; лимит бэкенда — AI_TIMEOUT_SECONDS (110 с)
const TIMEOUT_MS = 120_000;

export class ChatNetworkError extends Error {
  /** Честное сообщение, полученное от бэкенда ({ message }) */
  readonly serverMessage?: string;

  constructor(message: string, serverMessage?: string) {
    super(message);
    this.name = 'ChatNetworkError';
    this.serverMessage = serverMessage;
  }
}

export async function sendChatMessage(
  req: ChatRequest,
  outerSignal?: AbortSignal,
): Promise<ChatResponse> {
  const formData = new FormData();
  formData.append('sessionId', req.sessionId);
  formData.append('content', req.content);
  if (req.file) formData.append('file', req.file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  outerSignal?.addEventListener('abort', onOuterAbort, { once: true });

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    if (!response.ok) {
      let serverMessage: string | undefined;
      try {
        const data = (await response.json()) as { message?: string };
        serverMessage = data?.message;
      } catch {
        /* тело не JSON — покажем общее сообщение */
      }
      throw new ChatNetworkError('server', serverMessage);
    }

    const data = (await response.json()) as ChatResponse;
    if (!data?.reply?.content) throw new ChatNetworkError('server');
    return data;
  } catch (error) {
    if (error instanceof ChatNetworkError) throw error;
    // Отменён внешним сигналом (кнопкой «Стоп») — пробрасываем как есть
    if (outerSignal?.aborted) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ChatNetworkError('timeout');
    }
    throw new ChatNetworkError('offline');
  } finally {
    clearTimeout(timer);
    outerSignal?.removeEventListener('abort', onOuterAbort);
  }
}

export async function endChatSession(sessionId: string): Promise<ChatEndResponse> {
  try {
    const response = await fetch(`${BASE_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (!response.ok) return { ok: false };
    return (await response.json()) as ChatEndResponse;
  } catch {
    return { ok: false };
  }
}

export function resolveChatErrorMessage(error: unknown): string {
  if (error instanceof ChatNetworkError) {
    if (error.serverMessage) return error.serverMessage;
    if (error.message === 'timeout') {
      return 'Модель отвечает дольше обычного. Попробуйте отправить сообщение ещё раз или оставьте заявку.';
    }
    return error.message === 'offline'
      ? 'Нет связи с сервером консультанта. Проверьте подключение и повторите попытку.'
      : 'Сервис консультанта временно недоступен. Попробуйте позже или оставьте заявку — мы ответим лично.';
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Запрос отменён. Отправьте сообщение ещё раз.';
  }
  return 'Не удалось получить ответ. Попробуйте ещё раз или оставьте заявку.';
}
