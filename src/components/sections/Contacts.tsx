import { Phone, Mail, MapPin, Clock, type LucideIcon } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { siteConfig } from '@/config/site';

interface ContactItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const contactItems: readonly ContactItem[] = [
  {
    icon: Phone,
    label: 'Телефон',
    value: siteConfig.phone,
    href: siteConfig.phoneHref,
  },
  {
    icon: Mail,
    label: 'Email',
    value: siteConfig.email,
    href: siteConfig.emailHref,
  },
  {
    icon: MapPin,
    label: 'Адрес',
    value: siteConfig.address,
  },
  {
    icon: Clock,
    label: 'Приём заявок',
    value: 'Онлайн-заявки принимаются круглосуточно',
  },
];

/**
 * Контактная секция: как связаться и куда приехать.
 */
export function Contacts() {
  return (
    <Section id="contacts" tone="paper" className="py-20 md:py-28">
      <SectionHeading
        kicker="Контакты"
        title="Свяжитесь с нами удобным способом"
        lead="Позвоните, напишите или заезжайте в офис — обсудим задачу и подберём решение по поставке."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        {/* Контактные карточки */}
        <div className="grid gap-px border border-steel-200 bg-steel-200 sm:grid-cols-2">
          {contactItems.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center bg-copper-500/10 text-copper-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold tracking-[0.16em] text-steel-500 uppercase">
                    {item.label}
                  </span>
                  <span className="mt-1.5 block text-[15px] leading-snug font-medium break-words text-graphite-900">
                    {item.value}
                  </span>
                </span>
              </>
            );

            return (
              <Reveal key={item.label} delay={(i % 2) * 0.06}>
                {item.href ? (
                  <a
                    href={item.href}
                    className="flex h-full gap-4 bg-white p-6 transition-colors hover:bg-steel-50"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex h-full gap-4 bg-white p-6">{content}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* Карта офиса — OpenStreetMap (без API-ключей) */}
        <Reveal delay={0.1}>
          <div className="relative h-full min-h-[320px] overflow-hidden border border-steel-200 bg-steel-100">
            <iframe
              title="Расположение офиса ТОО «СнабПромТехМонтаж» на карте"
              src="https://www.openstreetmap.org/export/embed.html?bbox=82.55%2C50.70%2C82.65%2C50.75&layer=mapnik&marker=50.725%2C82.600"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[0.3]"
            />
            <div className="pointer-events-none absolute right-4 bottom-4 left-4 bg-graphite-900/92 px-5 py-4">
              <p className="text-[12px] font-semibold tracking-[0.16em] text-copper-400 uppercase">
                Офис в Усть-Каменогорске
              </p>
              <p className="mt-1.5 text-[14.5px] text-white">{siteConfig.address}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
