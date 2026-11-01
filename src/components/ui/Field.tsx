import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

const fieldBase =
  'w-full rounded-none border bg-white px-4 py-3 text-[15px] text-graphite-900 placeholder:text-steel-400 transition-colors duration-150 focus:outline-none disabled:bg-steel-50 disabled:text-steel-500';

function stateBorder(hasError: boolean): string {
  return hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    : 'border-steel-200 focus:border-copper-500 focus:ring-2 focus:ring-copper-500/25';
}

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldShell({ label, htmlFor, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold tracking-wide text-graphite-800">
        {label}
        {required ? <span className="ml-1 text-copper-500">*</span> : <span className="ml-1 text-steel-400">(необяз.)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-steel-500">{hint}</p>
      ) : null}
    </div>
  );
}

type SharedFieldProps = {
  label: string;
  error?: string;
  hint?: string;
};

export interface TextFieldProps
  extends SharedFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, required, className = '', ...rest },
  ref,
) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`${fieldBase} ${stateBorder(Boolean(error))} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
});

export interface TextAreaFieldProps
  extends SharedFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, required, className = '', ...rest }, ref) {
    const id = useId();
    return (
      <FieldShell label={label} htmlFor={id} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          className={`${fieldBase} min-h-[132px] resize-y ${stateBorder(Boolean(error))} ${className}`}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export interface SelectFieldProps
  extends SharedFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  options: readonly { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, required, options, className = '', ...rest },
  ref,
) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`${fieldBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235f6b74%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-11 ${stateBorder(Boolean(error))} ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});
