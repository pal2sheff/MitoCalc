import { betweenStudiesEvents, comparabilityItems, indicatorList } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Card } from '@/components/ui'

export function PreviousReportForm() {
  const { prevInputs, setPrevValue, dynamicsContext, updateDynamics, toggleInDynamics } = useMitoPassport()
  const filled = Object.keys(prevInputs).length

  return (
    <section className="mb-10">
      <details className="rounded-2xl border border-line bg-white p-5 shadow-sm" open={filled > 0}>
        <summary className="cursor-pointer text-sm font-semibold tracking-wide text-ink-soft uppercase">
          Предыдущий отчёт: оценка динамики {filled > 0 && <span className="normal-case">({filled} показателей)</span>}
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Необязательно. Если ввести значения предыдущего исследования, калькулятор сравнит отчёты по главе 8: переходы зон, смену
          знака проб, контуры, тип динамики. Изменения внутри одной зоны не интерпретируются.
        </p>

        <label className="mt-4 block max-w-xs text-sm text-ink">
          <span className="mb-1 block">Дата предыдущего исследования</span>
          <input
            type="text"
            placeholder="например, 12.06.2026"
            value={dynamicsContext.previousDate ?? ''}
            onChange={(e) => updateDynamics({ previousDate: e.target.value || undefined })}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {indicatorList.map((d) => (
            <label key={d.id} className="text-xs text-ink">
              <span className="mb-1 block min-h-8">{d.shortLabel}</span>
              <input
                type="number"
                inputMode="decimal"
                step={d.step}
                min={d.min}
                max={d.max}
                value={prevInputs[d.id] ?? ''}
                onChange={(e) => setPrevValue(d.id, e.target.value)}
                className="w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm"
              />
            </label>
          ))}
        </div>

        <Card className="mt-4 bg-panel">
          <p className="mb-2 text-sm font-medium text-ink">Условия сопоставимости (раздел 8.1)</p>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {comparabilityItems.map((i) => (
              <label key={i.id} className="flex items-start gap-2 text-sm text-ink">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={dynamicsContext.comparability.includes(i.id)}
                  onChange={() => toggleInDynamics('comparability', i.id)}
                />
                <span>{i.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 mb-2 text-sm font-medium text-ink">Что происходило между исследованиями</p>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {betweenStudiesEvents.map((i) => (
              <label key={i.id} className="flex items-start gap-2 text-sm text-ink">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={dynamicsContext.betweenEvents.includes(i.id)}
                  onChange={() => toggleInDynamics('betweenEvents', i.id)}
                />
                <span>{i.label}</span>
              </label>
            ))}
          </div>
        </Card>
      </details>
    </section>
  )
}
