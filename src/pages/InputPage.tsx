import { useNavigate } from 'react-router-dom'
import { block1Indicators, block2Indicators } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { IndicatorField } from '@/components/IndicatorField'

export function InputPage() {
  const navigate = useNavigate()
  const { inputs, setValue, loadExample, clearForm, calculate } = useMitoPassport()

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
            Заполните доступные показатели — расчёт работает и при частично заполненной форме.
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

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">
          Блок 1. Иммунно-клеточный и стрессовый статус
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block1Indicators.map((definition) => (
            <IndicatorField
              key={definition.id}
              definition={definition}
              value={inputs[definition.id]}
              onChange={(rawValue) => setValue(definition.id, rawValue)}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-ink-soft uppercase">
          Блок 2. Митохондриальные комплексы и дыхание (ΔNADH)
        </h2>
        <p className="mb-3 text-xs text-amber-700">
          Референсные пороги этого блока — редактируемые черновые значения и требуют клинической калибровки.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block2Indicators.map((definition) => (
            <IndicatorField
              key={definition.id}
              definition={definition}
              value={inputs[definition.id]}
              onChange={(rawValue) => setValue(definition.id, rawValue)}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleCalculate}>Рассчитать</Button>
      </div>
    </div>
  )
}
