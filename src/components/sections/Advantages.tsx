import { Check } from 'lucide-react';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { advantages } from '@/config/site';

/**
 * «Почему выбирают нас» — преимущества без выдуманной статистики.
 */
export function Advantages() {
  return (
    <Section id="advantages" tone="light" className="py-20 md:py-28">
      <SectionHeading
        kicker="Почему выбирают нас"
        title="Инженерный подход к поставкам промышленного оборудования"
      />

      <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {advantages.map((advantage, i) => (
          <Reveal key={advantage.title} delay={(i % 3) * 0.08}>
            <div className="flex gap-4">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-copper-500/10 text-copper-600">
                <Check className="size-4" aria-hidden />
              </span>
              <div>
                <h3 className="text-[16px] leading-snug font-semibold text-graphite-900">
                  {advantage.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-steel-600">
                  {advantage.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
