/**
 * Публичный контракт AI-консультанта.
 *
 * Ответы ассистента приходят ТОЛЬКО из chatApi (FastAPI backend вызывает
 * LLM, см. api/chatApi.ts). История диалога хранится на сервере по sessionId.
 * Здесь — типы запросов/ответов, состояния диалога и реэкспорт промптов.
 */

export { GREETING_MESSAGE, QUICK_REPLIES } from './prompts';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
}

export type DeliveryStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
  readonly attachment?: ChatAttachment;
  readonly status?: DeliveryStatus;
}

/** Запрос диалога */
export interface ChatRequest {
  /** Идентификатор сессии диалога (генерируется на клиенте, хранится в sessionStorage) */
  sessionId: string;
  /** Текст сообщения пользователя */
  content: string;
  /** Прикреплённый файл (опционально, до 10 МБ) */
  file?: File | null;
}

/** Ответ клиента AI: единственный источник текста ассистента */
export interface ChatResponse {
  sessionId: string;
  reply: {
    content: string;
  };
}

/** Завершение диалога: сервер очищает историю по sessionId */
export interface ChatEndResponse {
  ok: boolean;
}

export type ChatTransportStatus =
  | 'idle'
  | 'connecting'
  | 'awaiting-reply'
  | 'error'
  | 'ended';

export const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024;
