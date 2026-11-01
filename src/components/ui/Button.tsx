import { forwardRef, type ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'outline-light' | 'outline-dark' | 'ghost-light';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-copper-500 text-white hover:bg-copper-600 active:bg-copper-700 border border-copper-500 hover:border-copper-600',
  'outline-light':
    'bg-transparent text-white border border-white/35 hover:border-white hover:bg-white/10',
  'outline-dark':
    'bg-transparent text-graphite-900 border border-graphite-900/25 hover:border-graphite-900 hover:bg-graphite-900/5',
  'ghost-light': 'bg-transparent text-steel-300 hover:text-white border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-6 text-sm',
  lg: 'h-[54px] px-8 text-[15px]',
};

/**
 * Базовая кнопка дизайн-системы: строгая геометрия, лёгкий скос-акцент.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-none font-semibold tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    />
  );
});

interface ArrowProps {
  className?: string;
}

export function ArrowRight({ className = '' }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`size-4 ${className}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
    </svg>
  );
}
