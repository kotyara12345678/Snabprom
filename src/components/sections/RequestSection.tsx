import { useRef, useState } from 'react';
import { Loader2, Paperclip, X, Send, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { TextField, TextAreaField, SelectField } from '@/components/ui/Field';
import { directions, siteConfig } from '@/config/site';
import {
  validateApplication,
  validateFile,
  formatFileSize,
  type FormValues,
  type FormErrors,
} from '@/lib/validation';
import { submitApplication, ApiRejectedError, ApiUnavailableError } from '@/lib/api/requestsApi';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialValues: FormValues = {
  name: '',
  company: '',
  phone: '',
  email: '',
  direction: '',
  message: '',
  file: null,
};

const directionOptions = [
  { value: '', label: 'Выберите направление' },
  ...directions.map((d) => ({ value: d.title, label: d.title })),
];

/**
 * Форма заявки. Отправка идёт только через requestsApi -> backend.
 * При недоступном backend показывается честное сообщение, а не фейковый успех.
 */
export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key as keyof FormErrors]: undefined }));
    }
  };

  const handleFileChange = (file: File | null) => {
    const fileError = validateFile(file);
    setErrors((prev) => ({ ...prev, file: undefined }));
    if (fileError) {
      setStatus('error');
      setStatusMessage(fileError);
      return;
    }
    setStatus('idle');
    setStatusMessage('');
    setField('file', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateApplication(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    setStatusMessage('');

    try {
      await submitApplication({
        name: values.name,
        company: values.company,
        phone: values.phone,
        email: values.email,
        direction: values.direction,
        message: values.message,
        file: values.file,
      });
      setStatus('success');
      setValues(initialValues);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiRejectedError || error instanceof ApiUnavailableError) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage('Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="border border-steel-200 bg-white p-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" aria-hidden />
        <h3 className="mt-4 text-[20px] font-semibold text-graphite-900">Заявка отправлена</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-steel-600">
          Мы свяжемся с вами в рабочее время. Если вопрос срочный — позвоните:{' '}
          <a href={siteConfig.phoneHref} className="font-semibold text-copper-600 underline-offset-2 hover:underline">
            {siteConfig.phone}
          </a>
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-[14px] font-semibold text-copper-600 underline-offset-2 hover:underline"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-steel-200 bg-white p-6 md:p-10"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Имя"
          name="name"
          required
          placeholder="Иван Иванов"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          label="Компания"
          name="company"
          placeholder="ТОО «Пример»"
          value={values.company}
          onChange={(e) => setField('company', e.target.value)}
          error={errors.company}
          autoComplete="organization"
        />
        <TextField
          label="Телефон"
          name="phone"
          type="tel"
          required
          placeholder="+7 700 000 00 00"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="name@company.kz"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <div className="sm:col-span-2">
          <SelectField
            label="Направление"
            name="direction"
            required
            options={directionOptions}
            value={values.direction}
            onChange={(e) => setField('direction', e.target.value)}
            error={errors.direction}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="Описание задачи"
            name="message"
            required
            placeholder="Опишите оборудование или комплектующие, которые требуется подобрать: параметры, объёмы, сроки."
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            error={errors.message}
          />
        </div>

        {/* Файл */}
        <div className="sm:col-span-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold tracking-wide text-graphite-800">
                Техническое задание или спецификация <span className="text-steel-400">(необяз.)</span>
              </p>
              <p className="mt-1 text-[13px] text-steel-500">
                PDF, DOCX, XLSX или изображение до 10 МБ
              </p>
            </div>
            <Button
              variant="outline-dark"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <Paperclip className="size-4" /> Прикрепить файл
            </Button>
          </div>
          {values.file ? (
            <div className="mt-4 flex items-center justify-between gap-3 border border-steel-200 bg-steel-50 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2 text-[14px] text-graphite-800">
                <Paperclip className="size-4 shrink-0 text-copper-500" aria-hidden />
                <span className="truncate font-medium">{values.file.name}</span>
                <span className="shrink-0 text-steel-500">{formatFileSize(values.file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setField('file', null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Удалить файл"
                className="shrink-0 text-steel-500 transition-colors hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Статус отправки */}
      {status === 'error' && statusMessage ? (
        <p
          role="alert"
          className="mt-6 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-[14px] leading-relaxed text-red-700"
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Отправляем…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden /> Отправить заявку
            </>
          )}
        </Button>
        <p className="text-[13px] leading-relaxed text-steel-500">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных для связи по заявке.
        </p>
      </div>
    </form>
  );
}

export function RequestSection() {
  return (
    <Section id="request" tone="dark" className="py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label-kicker mb-5">Оставить заявку</p>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.08] font-bold text-white">
              Расскажите о задаче — подготовим предложение по поставке
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-steel-300">
              Приложите техническое задание или спецификацию — так подбор оборудования и расчёт
              поставки будут точнее. Отвечаем в рабочее время.
            </p>
            <dl className="mt-10 space-y-5 border-t border-white/12 pt-8">
              <div>
                <dt className="text-[12px] font-semibold tracking-[0.16em] text-steel-500 uppercase">
                  Телефон
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={siteConfig.phoneHref}
                    className="font-display text-[19px] font-semibold text-white transition-colors hover:text-copper-300"
                  >
                    {siteConfig.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold tracking-[0.16em] text-steel-500 uppercase">
                  Email
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={siteConfig.emailHref}
                    className="text-[16px] break-all text-white transition-colors hover:text-copper-300"
                  >
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold tracking-[0.16em] text-steel-500 uppercase">
                  Адрес
                </dt>
                <dd className="mt-1.5 text-[16px] text-white">{siteConfig.address}</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
