import { Section, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import { aboutHighlights } from '@/config/site';

export function About() {
  return (
    <Section id="about" tone="light" className="py-20 md:py-28">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Текстовый блок */}
        <div>
          <SectionHeading
            kicker="О компании"
            title={
              <>
                ТОО «СнабПромТехМонтаж» — поставки промышленного оборудования из Китая под ключ
              </>
            }
          />
          <Reveal delay={0.1}>
            <div className="mt-7 space-y-5 text-[16px] leading-relaxed text-steel-600">
              <p>
                Мы организуем поставки промышленного оборудования, комплектующих и запасных частей
                напрямую с заводов-изготовителей в Китае. Работаем с предприятиями горнодобывающей
                и обрабатывающей промышленности Казахстана.
              </p>
              <p>
                Задача компании — закрыть цикл поставки целиком: разобраться в техническом задании,
                подобрать и проверить производителя, согласовать спецификацию, проконтролировать
                качество, организовать логистику и довести оборудование до запуска на объекте
                заказчика.
              </p>
              <p>
                Мы не продаём типовые каталоги — каждый проект начинается с параметров вашего
                объекта и требований к оборудованию.
              </p>
            </div>
          </Reveal>

          {/* Три опоры */}
          <div className="mt-10 grid gap-px border border-steel-200 bg-steel-200 sm:grid-cols-3">
            {aboutHighlights.map((item, i) => (
              <Reveal key={item.title} delay={0.15 + i * 0.08}>
                <div className="h-full bg-white p-6">
                  <div className="mb-4 h-0.5 w-8 bg-copper-500" aria-hidden />
                  <h3 className="text-[15px] leading-snug font-semibold text-graphite-900">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-steel-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Изображение */}
        <Reveal delay={0.12} className="lg:sticky lg:top-24">
          <div className="relative">
            <SmartImage
              src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80"
              alt="Инженеры на промышленном объекте обсуждают поставку оборудования"
              className="aspect-[4/5] w-full object-cover"
            />
            {/* Техническая плашка вместо маркетинговых « цифр» */}
            <div className="absolute -bottom-6 -left-4 border-l-2 border-copper-500 bg-graphite-900 p-6 shadow-xl sm:-left-8">
              <p className="font-display text-[15px] font-semibold text-white">
                Полный цикл поставки
              </p>
              <p className="mt-1.5 text-[13px] text-steel-400">
                Подбор → производство → логистика → пусконаладка
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
