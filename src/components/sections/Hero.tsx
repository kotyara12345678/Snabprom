import { motion, useReducedMotion } from 'framer-motion';
import { Ship, ShieldCheck, Wrench } from 'lucide-react';
import { Button, ArrowRight } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';

const highlights = [
  { icon: Ship, text: 'Прямые поставки с заводов Китая' },
  { icon: ShieldCheck, text: 'Контроль качества перед отгрузкой' },
  { icon: Wrench, text: 'Пусконаладка на объекте заказчика' },
] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden bg-graphite-900 pt-[72px] text-white">
      {/* Фоновое изображение промышленного объекта */}
      <div className="absolute inset-0" aria-hidden>
        <SmartImage
          src="https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="size-full object-cover object-center opacity-30 grayscale-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite-900 via-graphite-900/92 to-graphite-900/55" />
        <div className="grid-technical-dark absolute inset-0 opacity-70" />
      </div>

      <div className="container-page relative py-20 md:py-28 lg:py-36">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="label-kicker mb-6">Промышленное оборудование из Китая</p>

          <h1 className="font-display text-[clamp(32px,6.2vw,68px)] leading-[1.04] font-bold">
            Комплексные поставки
            <br className="hidden sm:block" /> промышленного оборудования{' '}
            <span className="text-copper-400">под задачи заказчика</span>
          </h1>

          <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-steel-300 md:text-[19px]">
            ТОО «СнабПромТехМонтаж» сопровождает поставку от подбора производителя в Китае до
            пусконаладки на объекте: техническое согласование, контроль качества, логистика и ввод
            оборудования в эксплуатацию.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#request">
              <Button size="lg">
                Оставить заявку <ArrowRight />
              </Button>
            </a>
            <a href="#directions">
              <Button variant="outline-light" size="lg">
                Направления поставок
              </Button>
            </a>
          </div>

          {/* Ключевые тезисы — без выдуманной статистики */}
          <ul className="mt-14 grid gap-4 border-t border-white/12 pt-8 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-copper-400" aria-hidden />
                <span className="text-[14px] leading-snug text-steel-200">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Техническая полоса внизу hero */}
      <div className="relative border-t border-white/12 bg-graphite-950/80">
        <div className="container-page flex flex-wrap items-center gap-x-10 gap-y-3 py-4">
          <span className="text-[12px] font-semibold tracking-[0.18em] text-steel-500 uppercase">
            Работаем на условиях
          </span>
          {['EXW', 'CIF', 'DDP'].map((term) => (
            <span key={term} className="font-display text-[15px] font-semibold tracking-wider text-white">
              {term}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
