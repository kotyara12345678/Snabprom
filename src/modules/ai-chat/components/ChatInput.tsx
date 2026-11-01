import { useRef, useState, type KeyboardEvent } from 'react';
import { Paperclip, SendHorizonal, X } from 'lucide-react';
import { formatFileSize } from '@/lib/validation';

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  file: File | null;
  fileError: string | null;
  onAttach: (file: File | null) => void;
  onSend: (content: string) => void;
}

export function ChatInput({
  disabled = false,
  placeholder = 'Напишите сообщение…',
  file,
  fileError,
  onAttach,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-steel-200 bg-white px-4 pt-3 pb-4 md:px-5">
      {file ? (
        <div className="mb-3 flex items-center justify-between gap-3 border border-steel-200 bg-steel-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-[13px] text-graphite-800">
            <Paperclip className="size-4 shrink-0 text-copper-500" aria-hidden />
            <span className="truncate font-medium">{file.name}</span>
            <span className="shrink-0 text-steel-500">{formatFileSize(file.size)}</span>
          </div>
          <button
            type="button"
            onClick={() => onAttach(null)}
            aria-label="Удалить вложение"
            className="shrink-0 text-steel-500 transition-colors hover:text-red-600"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {fileError ? (
        <p role="alert" className="mb-3 text-[13px] font-medium text-red-600">
          {fileError}
        </p>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            onAttach(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Прикрепить документ"
          title="Прикрепить документ (PDF, DOCX, XLSX, изображение)"
          className="flex size-11 shrink-0 items-center justify-center border border-steel-200 text-steel-500 transition-colors hover:border-copper-500 hover:text-copper-500 disabled:opacity-40"
        >
          <Paperclip className="size-[18px]" />
        </button>

        <label className="sr-only" htmlFor="ai-chat-input">
          Сообщение консультанту
        </label>
        <textarea
          id="ai-chat-input"
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-32 min-h-[44px] flex-1 resize-none border border-steel-200 bg-white px-3.5 py-3 text-[14.5px] text-graphite-900 placeholder:text-steel-400 focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20 focus:outline-none disabled:bg-steel-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Отправить сообщение"
          className="flex size-11 shrink-0 items-center justify-center bg-copper-500 text-white transition-colors hover:bg-copper-600 disabled:cursor-not-allowed disabled:bg-steel-300"
        >
          <SendHorizonal className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
