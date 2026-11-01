import { useState, type ImgHTMLAttributes } from 'react';

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  /** Класс контейнера-заглушки при ошибке загрузки */
  fallbackClassName?: string;
}

/**
 * Изображение с честной заглушкой: если фото не загрузилось (нет сети,
 * битая ссылка), вместо дыры показывается фирменная техническая плашка.
 */
export function SmartImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  ...rest
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid-technical-dark flex items-center justify-center bg-graphite-800 ${className} ${fallbackClassName}`}
      >
        <div className="flex flex-col items-center gap-3 text-steel-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-9">
            <path d="M3 7h18v13H3zM3 7l4-4h10l4 4M8 13h8" />
          </svg>
          <span className="px-4 text-center text-[11px] tracking-[0.18em] uppercase">
            СнабПромТехМонтаж
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
