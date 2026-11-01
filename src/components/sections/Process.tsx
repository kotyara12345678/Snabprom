import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { processSteps } from '@/config/site';

/**
 * «Как мы работаем» — вертикальная временная шкала из 6 шагов.
 */
export function Process() {
  return (
    <Section id="process" tone="light" className="py-20 md:py-28">
      <SectionHeading
        kicker="Как мы работаем"
        title="Шесть этапов от запроса до запуска оборудования"
        lead="Прозрачный процесс без «сюрпризов»: каждый шаг фиксируется и согласуется с заказчиком."
      />

      <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:gap-x-14">
        {processSteps.map((step, i) => (
          <Reveal key={step.index} delay={(i % 2) * 0.08}>
            <li className="group relative flex gap-6 border-t border-steel-200 pt-7">
              <span
                className="font-display text-[40px] leading-none font-bold text-steel-200 transition-colors duration-300 group-hover:text-copper-400"
                aria-hidden
              >
                {step.index}
              </span>
              <div>
                <h3 className="text-[18px] leading-snug font-semibold text-graphite-900">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-steel-600">
                  {step.description}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
