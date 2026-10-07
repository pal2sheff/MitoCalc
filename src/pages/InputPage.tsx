import { useNavigate } from 'react-router-dom'
import { block1Indicators, block2Indicators, panels } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { IndicatorField } from '@/components/IndicatorField'
import { PanelSelector } from '@/components/context/PanelSelector'
import { ClinicalContextForm } from '@/components/context/ClinicalContextForm'

export function InputPage() {
  const navigate = useNavigate()
  const { inputs, setValue, loadExample, clearForm, calculate, priorityContext } = useMitoPassport()

  const panel = panels.find((p) => p.id === priorityContext.panel)
  const visible = (id: string) =>
    !panel || panel.indicatorIds.some((x) => x === id) || panel.optionalIndicatorIds.some((x) => x === id)
  const block1 = block1Indicators.filter((d) => visible(d.id))
  const block2 = block2Indicators.filter((d) => visible(d.id))

  function handleCalculate() {
    calculate()
    navigate('/result')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Ввод показателей МИТО-паспорта</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Заполните показатели, которые есть в отчёте. Неизмеренные показатели не считаются нормой: зависящие от них паттерны и контуры отмечаются как неоценённые.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadExample}>
            Загрузить пример
          </Button>
          <Button variant="ghost" onClick={clearForm}>
            Очистить форму
          </Button>
        </div>
      </header>

      <PanelSelector />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">
          Блок 1. Иммунно-клеточный и стрессовый статус
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block1.map((definition) => (
            <IndicatorField
              key={definition.id}
              definition={definition}
              value={inputs[definition.id]}
              onChange={(rawValue) => setValue(definition.id, rawValue)}
            />
          ))}
        </div>
      </section>

      {block2.length > 0 && (
      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-ink-soft uppercase">
          Блок 2. Митохондриальные комплексы и дыхание (ΔNADH)
        </h2>
        <p className="mb-3 text-xs text-amber-700">
          Ориентируйтесь на число, а не на стрелку бланка: значения выходят за шкалу ±20. Знак читается по пособию (минус — обходной путь, у комплекса V — снижение синтеза АТФ). Числовые границы «около нуля» (±15) и «выражено» (40) черновые и требуют решения авторов.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block2.map((definition) => (
            <IndicatorField
              key={definition.id}
              definition={definition}
              value={inputs[definition.id]}
              onChange={(rawValue) => setValue(definition.id, rawValue)}
            />
          ))}
        </div>
      </section>
      )}

      <ClinicalContextForm />

      <div className="flex justify-end">
        <Button onClick={handleCalculate}>Рассчитать</Button>
      </div>
    </div>
  )
}
