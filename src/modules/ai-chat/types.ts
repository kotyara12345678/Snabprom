/**
 * Публичный контракт AI-консультанта.
 *
 * Frontend никогда не генерирует ответы сам: единственный источник
 * ответов — backend (endpoint см. chatApi.ts). Здесь описаны только
 * типы запросов/ответов и состояния диалога.
 */

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

/** Запрос диалога: POST multipart/form-data на /api/chat */
export interface ChatRequest {
  /** Идентификатор сессии диалога (генерируется на клиенте, хранится в sessionStorage) */
  sessionId: string;
  /** Текст сообщения пользователя */
  content: string;
  /** Прикреплённый файл (опционально, до 10 МБ) */
  file?: File | null;
}

/** Ответ backend: единственное допустимое происхождение текста ассистента */
export interface ChatResponse {
  sessionId: string;
  reply: {
    content: string;
  };
}

/** Завершение диалога: DELETE/POST на /api/chat/session */
export interface ChatEndResponse {
  ok: boolean;
}

export type ChatTransportStatus =
  | 'idle'
  | 'connecting'
  | 'awaiting-reply'
  | 'error'
  | 'ended';

export const CHAT_ERRORS = {
  offline: 'Нет связи с сервером консультанта. Проверьте подключение и повторите попытку.',
  server: 'Сервис консультанта временно недоступен. Попробуйте позже или оставьте заявку — мы ответим лично.',
} as const;

export const GREETING_MESSAGE =
  'Здравствуйте! Я виртуальный консультант ТОО «СнабПромТехМонтаж». Помогу разобраться с подбором промышленного оборудования и подготовить запрос на поставку. Расскажите, что вас интересует.';

export const QUICK_REPLIES: readonly string[] = [
  'Подобрать оборудование',
  'Запросить комплектующие',
  'Рассчитать поставку',
  'Отправить техническую спецификацию',
];

export const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024;
