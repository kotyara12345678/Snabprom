import { Mail, Phone, MapPin } from 'lucide-react';
import { navigation, siteConfig } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-graphite-950 text-steel-400">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Логотип и описание */}
          <div className="lg:col-span-5">
            <p className="font-display text-lg font-bold tracking-wide text-white">
              СНАБПРОМ<span className="text-copper-400">ТЕХ</span>МОНТАЖ
            </p>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed">
              Поставка промышленного оборудования и комплектующих из Китая: подбор производителя,
              контроль качества, логистика и пусконаладка на объекте заказчика.
            </p>
          </div>

          {/* Навигация */}
          <nav aria-label="Навигация в подвале" className="lg:col-span-3">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-steel-500 uppercase">
              Разделы
            </p>
            <ul className="mt-4 space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[14px] text-steel-300 transition-colors hover:text-copper-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div className="lg:col-span-4">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-steel-500 uppercase">
              Контакты
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-2.5 text-[14px] text-steel-300 transition-colors hover:text-white"
                >
                  <Phone className="size-4 text-copper-400" aria-hidden />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.emailHref}
                  className="flex items-center gap-2.5 text-[14px] break-all text-steel-300 transition-colors hover:text-white"
                >
                  <Mail className="size-4 text-copper-400" aria-hidden />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[14px] text-steel-300">
                <MapPin className="mt-0.5 size-4 shrink-0 text-copper-400" aria-hidden />
                {siteConfig.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. Все права защищены.
          </p>
          <p className="text-steel-500">
            Информация на сайте не является публичной офертой.
          </p>
        </div>
      </div>
    </footer>
  );
}
