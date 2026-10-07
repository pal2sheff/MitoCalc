import { betweenStudiesEvents, comparabilityItems, indicatorList } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'

const inputCls = 'w-full rounded border border-line bg-paper px-2 py-1.5 text-right text-sm focus:border-brand focus:outline-none'

export function PreviousReportForm() {
  const { prevInputs, setPrevValue, dynamicsContext, updateDynamics, toggleInDynamics } = useMitoPassport()
  const filled = Object.keys(prevInputs).length

  const checks = (key: 'comparability' | 'betweenEvents', items: { id: string; label: string }[]) => (
    <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
      {items.map((i) => (
        <label key={i.id} className="flex items-start gap-2.5 text-sm text-ink">
          <input className="mt-0.5 h-4 w-4 shrink-0" type="checkbox" checked={dynamicsContext[key].includes(i.id)} onChange={() => toggleInDynamics(key, i.id)} />
          <span>{i.label}</span>
        </label>
      ))}
    </div>
  )

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Значения прошлого исследования. Калькулятор сравнит отчёты по главе 8; колебания внутри одной зоны не интерпретируются.
      </p>
      <label className="mt-4 block max-w-[12rem] text-sm">
        <span className="mb-1 block text-ink-soft">Дата исследования</span>
        <input type="text" placeholder="12.06.2026" value={dynamicsContext.previousDate ?? ''} onChange={(e) => updateDynamics({ previousDate: e.target.value || undefined })} className={inputCls.replace('text-right', '')} />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {indicatorList.map((d) => (
          <label key={d.id} className="text-xs text-ink-soft">
            <span className="mb-1 block truncate" title={d.label}>
              {d.shortLabel}
            </span>
            <input type="number" inputMode="decimal" step={d.step} min={d.min} max={d.max} value={prevInputs[d.id] ?? ''} onChange={(e) => setPrevValue(d.id, e.target.value)} className={inputCls} />
          </label>
        ))}
      </div>
      {filled > 0 && (
        <div className="mt-5 grid gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Условия сопоставимости</p>
            {checks('comparability', comparabilityItems)}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Что было между исследованиями</p>
            {checks('betweenEvents', betweenStudiesEvents)}
          </div>
        </div>
      )}
    </div>
  )
}
