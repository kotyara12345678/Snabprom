/**
 * Валидация формы заявки. Чистые функции без зависимостей —
 * переиспользуются в форме и в тестах.
 */

export type FormValues = {
  name: string;
  company: string;
  phone: string;
  email: string;
  direction: string;
  message: string;
  file: File | null;
};

export type FormErrors = Partial<Record<keyof Omit<FormValues, 'file'>, string>>;

const PHONE_RE = /^(\+?7|8)?\s*\(?\d{3}\)?\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'webp'];

export function validateFile(file: File | null): string | undefined {
  if (!file) return undefined;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'Допустимы файлы: PDF, DOCX, XLSX, изображения (JPG, PNG, WEBP)';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Файл больше 10 МБ — сократите объём или пришлите его на email';
  }
  return undefined;
}

export function validateApplication(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Укажите имя (минимум 2 символа)';
  }
  if (values.company.trim().length > 120) {
    errors.company = 'Слишком длинное название';
  }
  if (!PHONE_RE.test(values.phone.trim())) {
    errors.phone = 'Укажите телефон в формате +7 700 000 00 00';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Укажите корректный email';
  }
  if (!values.direction) {
    errors.direction = 'Выберите направление оборудования';
  }
  if (values.message.trim().length < 10) {
    errors.message = 'Опишите задачу подробнее (минимум 10 символов)';
  }

  return errors;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
