import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark' | 'paper';
  containerClassName?: string;
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  light: 'bg-white text-graphite-900',
  dark: 'bg-graphite-900 text-white',
  paper: 'bg-paper text-graphite-900',
};

export function Section({
  id,
  children,
  className = '',
  tone = 'light',
  containerClassName = '',
}: SectionProps) {
  return (
    <section id={id} className={`relative ${toneClasses[tone]} ${className}`}>
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  lead?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}

export function SectionHeading({
  kicker,
  title,
  lead,
  align = 'left',
  tone = 'light',
}: SectionHeadingProps) {
  const isDark = tone === 'dark';
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <Reveal>
        {kicker ? <p className="label-kicker mb-5">{kicker}</p> : null}
        <h2
          className={`text-[clamp(28px,4vw,46px)] leading-[1.08] font-bold ${isDark ? 'text-white' : 'text-graphite-900'}`}
        >
          {title}
        </h2>
        {lead ? (
          <p
            className={`mt-5 text-[17px] leading-relaxed ${isDark ? 'text-steel-300' : 'text-steel-600'}`}
          >
            {lead}
          </p>
        ) : null}
      </Reveal>
    </div>
  );
}
