/**
 * API-слой формы заявки.
 *
 * Контракт с backend:
 *   POST {VITE_REQUESTS_API_URL || '/api/requests'}
 *   Content-Type: multipart/form-data
 *   поля: name, company, phone, email, direction, message, file?
 *
 * Ответы:
 *   200/201 -> { ok: true }
 *   4xx/5xx -> { ok: false, message?: string }
 *
 * Слой принципиально не имитирует успешную отправку: при недоступном
 * backend функция бросает ApiUnavailableError с понятным сообщением.
 */

export interface ApplicationPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  direction: string;
  message: string;
  file?: File | null;
}

export class ApiUnavailableError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ApiUnavailableError';
    this.cause = cause;
  }
}

export class ApiRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRejectedError';
  }
}

const ENDPOINT = import.meta.env.VITE_REQUESTS_API_URL ?? '/api/requests';
const REQUEST_TIMEOUT_MS = 15_000;

export async function submitApplication(payload: ApplicationPayload): Promise<void> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('company', payload.company);
  formData.append('phone', payload.phone);
  formData.append('email', payload.email);
  formData.append('direction', payload.direction);
  formData.append('message', payload.message);
  if (payload.file) formData.append('file', payload.file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiUnavailableError(
      'Сервер приёма заявок пока недоступен. Свяжитесь с нами по телефону или email — мы обязательно ответим.',
      error,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const data = (await response.json()) as { message?: string };
      serverMessage = data.message ?? '';
    } catch {
      /* тело не JSON — игнорируем */
    }
    throw new ApiRejectedError(
      serverMessage || 'Сервер отклонил заявку. Попробуйте позже или свяжитесь с нами напрямую.',
    );
  }
}
