import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import { directions } from '@/config/site';

/**
 * Шесть направлений поставок — карточки с фото, заголовком и описанием.
 */
export function Directions() {
  return (
    <Section id="directions" tone="paper" className="py-20 md:py-28">
      <SectionHeading
        kicker="Направления поставок"
        title="Оборудование и комплектующие по профилю вашего производства"
        lead="Подбираем и поставляем оборудование под конкретные задачи объекта — от карьерной дробильной установки до отдельного узла или запасной части."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {directions.map((direction, i) => (
          <Reveal key={direction.id} delay={(i % 3) * 0.08}>
            <article className="group flex h-full flex-col border border-steel-200 bg-white transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(8,9,11,0.12)]">
              <div className="relative overflow-hidden">
                <SmartImage
                  src={direction.image}
                  alt={direction.imageAlt}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute top-0 left-0 bg-graphite-900 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-copper-400 uppercase">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[17px] leading-snug font-semibold text-graphite-900">
                  {direction.title}
                </h3>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-steel-600">
                  {direction.description}
                </p>
                <a
                  href="#request"
                  className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-semibold tracking-wide text-copper-600 transition-colors hover:text-copper-700"
                >
                  Запросить поставку
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
                  </svg>
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
