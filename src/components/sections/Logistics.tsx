import { Ship } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import { incoterms } from '@/config/site';

/**
 * География и логистика: условия поставки EXW / CIF / DDP.
 */
export function Logistics() {
  return (
    <Section id="logistics" tone="paper" className="py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            kicker="География и логистика"
            title="Международная доставка на условиях, удобных заказчику"
            lead="Организуем перевозку от заводов Китая до объекта заказчика в Казахстане. Условия поставки фиксируются в договоре."
          />

          <div className="mt-10 space-y-px border border-steel-200 bg-steel-200">
            {incoterms.map((term) => (
              <Reveal key={term.code}>
                <div className="flex flex-col gap-3 bg-white p-6 sm:flex-row sm:gap-8">
                  <div className="shrink-0">
                    <span className="font-display text-[22px] leading-none font-bold tracking-wide text-copper-500">
                      {term.code}
                    </span>
                    <p className="mt-1.5 text-[12px] tracking-wide text-steel-500 uppercase">
                      {term.title}
                    </p>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-steel-600">{term.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Изображение логистики */}
        <Reveal delay={0.1} className="lg:pt-16">
          <div className="relative">
            <SmartImage
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1400&q=80"
              alt="Контейнеровоз в порту — международная логистика поставок"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex items-center gap-4 bg-graphite-900 px-6 py-5">
              <Ship className="size-6 shrink-0 text-copper-400" aria-hidden />
              <p className="text-[14px] leading-relaxed text-steel-300">
                Морские и наземные контейнерные перевозки, оформление экспортной документации и
                таможенное сопровождение.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
