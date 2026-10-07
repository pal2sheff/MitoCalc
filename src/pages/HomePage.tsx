import { useNavigate } from 'react-router-dom'
import { Button, ZoneScale } from '@/components/ui'
import { referenceRanges } from '@/config'

const STEPS = [
  ['Показатель', 'зона на шкале, как в бланке'],
  ['Контур', 'шесть функциональных контуров'],
  ['Паттерн', 'один ведущий механизм из пятнадцати'],
  ['Заключение', 'по шаблону, с планом обследования'],
]

export function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end">
        <div>
          <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
            Интерпретация иммунно-митохондриального анализа
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Калькулятор для врача по пособию «Интерпретация митопаспорта». Введите показатели из бланка — получите контуры, ведущий
            паттерн, план обследования и черновик заключения.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/input')}>Ввести результат</Button>
            <Button variant="ghost" onClick={() => navigate('/decisions')}>
              Черновые решения
            </Button>
          </div>
        </div>
        <div className="border border-line bg-paper p-5" aria-hidden="true">
          <p className="text-xs text-ink-soft">Фагоцитоз</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-ink">37 %</span>
            <span className="text-sm text-[#8a4310]">снижен</span>
          </div>
          <ZoneScale value={37} config={referenceRanges.phagocytosis} valueType="absolute" />
          <p className="mt-4 text-xs text-ink-soft">Проба на клеточный стресс</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-ink">−30</span>
            <span className="text-sm text-[#8a4310]">ответа нет</span>
          </div>
          <ZoneScale value={-30} config={referenceRanges.stressReaction} valueType="deltaNadh" />
        </div>
      </div>

      <ol className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-4">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="bg-paper p-4">
            <span className="text-xs text-ink-faint">{i + 1}</span>
            <p className="mt-1 text-sm font-medium text-ink">{title}</p>
            <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Для врачей. Анализ функциональный и дополнительный: калькулятор не ставит диагноз и не назначает лечение. Диагноз
        устанавливается по клинической картине, анамнезу и стандартному обследованию.
      </p>
    </div>
  )
}
