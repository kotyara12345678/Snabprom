import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { navigation, siteConfig } from '@/config/site';
import { Button, ArrowRight } from '@/components/ui/Button';

function LogoMark() {
  return (
    <span className="relative flex size-9 items-center justify-center bg-copper-500" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="size-5">
        <path d="M3 20h18M6 20V10l6-5 6 5v10M10 20v-6h4v6" strokeLinecap="square" />
      </svg>
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Закрытие мобильного меню по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-graphite-900/97 shadow-[0_1px_0_rgba(255,255,255,0.08)]' : 'bg-graphite-900'
      }`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        {/* Логотип */}
        <a href="#top" className="flex items-center gap-3">
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-bold tracking-wide text-white">
              СНАБПРОМ
              <span className="text-copper-400">ТЕХ</span>
            </span>
            <span className="mt-1 text-[10px] tracking-[0.24em] text-steel-400 uppercase">
              Монтаж
            </span>
          </span>
        </a>

        {/* Десктопная навигация */}
        <nav aria-label="Основная навигация" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-7">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[13.5px] font-medium text-steel-300 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Контакт + CTA */}
        <div className="flex items-center gap-3">
          <a
            href={siteConfig.phoneHref}
            className="hidden items-center gap-2 text-[14px] font-semibold text-white transition-colors hover:text-copper-300 md:flex"
          >
            <Phone className="size-4 text-copper-400" aria-hidden />
            {siteConfig.phone}
          </a>
          <a href="#request" className="hidden sm:block">
            <Button size="md">
              Оставить заявку <ArrowRight />
            </Button>
          </a>

          {/* Мобильное меню */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            className="flex size-10 items-center justify-center border border-white/20 text-white lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Мобильная панель */}
      {open ? (
        <div className="border-t border-white/10 bg-graphite-900 lg:hidden">
          <nav aria-label="Мобильная навигация" className="container-page py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-l-2 border-transparent py-2.5 pl-3 text-[15px] font-medium text-steel-200 transition-colors hover:border-copper-500 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <a
                href={siteConfig.phoneHref}
                className="flex items-center gap-2 text-[15px] font-semibold text-white"
              >
                <Phone className="size-4 text-copper-400" aria-hidden />
                {siteConfig.phone}
              </a>
              <a href="#request" onClick={() => setOpen(false)}>
                <Button size="md" className="w-full">
                  Оставить заявку <ArrowRight />
                </Button>
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
