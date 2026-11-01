import {
  Search,
  ClipboardCheck,
  ShieldCheck,
  Ship,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { services } from '@/config/site';

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  'clipboard-check': ClipboardCheck,
  'shield-check': ShieldCheck,
  ship: Ship,
  truck: Truck,
  wrench: Wrench,
};

/**
 * Шесть услуг (этапов сопровождения) — нумерованные блоки.
 */
export function Services() {
  return (
    <Section id="services" tone="dark" className="py-20 md:py-28">
      <SectionHeading
        kicker="Наши услуги"
        tone="dark"
        title="Сопровождаем поставку на каждом этапе"
        lead="Один подрядчик вместо цепочки посредников: подбор, контроль, логистика и запуск оборудования."
      />

      <div className="mt-14 grid gap-px border border-graphite-700 bg-graphite-700 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = iconMap[service.icon] ?? Search;
          return (
            <Reveal key={service.id} delay={(i % 3) * 0.08}>
              <div className="group h-full bg-graphite-900 p-7 transition-colors duration-300 hover:bg-graphite-850 md:p-8">
                <div className="flex items-start justify-between">
                  <span className="font-display text-[13px] font-semibold tracking-[0.18em] text-steel-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon
                    className="size-6 text-copper-400 transition-transform duration-300 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-8 text-[17px] leading-snug font-semibold text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-steel-400">
                  {service.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
