import type { ReactNode } from 'react'
import type { CbcInputs, InfectionPeriod } from '@/engine'
import { clinicalFindings, clinicalSituations, controlGoals, infectionPeriods, preanalyticItems } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'

function CheckList({ items, selected, onToggle }: { items: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
          <input className="mt-0.5 h-4 w-4 shrink-0" type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  )
}

function Group({ title, hint, count, children }: { title: string; hint: string; count: number; children: ReactNode }) {
  return (
    <details className="group border-b border-line-soft py-3 last:border-0" open={count > 0}>
      <summary className="flex cursor-pointer items-baseline justify-between gap-3 select-none">
        <span className="flex items-baseline gap-2">
          <svg className="h-3 w-3 shrink-0 self-center text-ink-faint transition-transform group-open:rotate-90" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M7.5 5 12.5 10 7.5 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium text-ink">{title}</span>
          <span className="hidden text-xs text-ink-faint sm:inline">{hint}</span>
        </span>
        {count > 0 && <span className="rounded bg-brand-tint px-2 py-0.5 text-xs text-brand">отмечено: {count}</span>}
      </summary>
      <div className="mt-3 pl-5">{children}</div>
    </details>
  )
}

const CBC_FIELDS: { key: keyof CbcInputs; label: string; unit: string }[] = [
  { key: 'neutrophilsAbs', label: 'Нейтрофилы', unit: '×10⁹/л' },
  { key: 'lymphocytesAbs', label: 'Лимфоциты', unit: '×10⁹/л' },
  { key: 'lymphocytesPct', label: 'Лимфоциты', unit: '%' },
]

const inputCls = 'w-full rounded border border-line bg-paper px-2.5 py-1.5 text-sm focus:border-brand focus:outline-none'

export function ClinicalContextForm() {
  const { priorityContext: ctx, updateContext, toggleInContext } = useMitoPassport()
  const cbcCount = Object.keys(ctx.cbc).length

  function setCbc(key: keyof CbcInputs, raw: string) {
    const next = { ...ctx.cbc }
    const v = Number.parseFloat(raw.replace(',', '.'))
    if (raw.trim() === '' || !Number.isFinite(v)) delete next[key]
    else next[key] = v
    updateContext({ cbc: next })
  }

  return (
    <div>
      <div className="grid gap-4 border-b border-line-soft pb-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Дата исследования</span>
          <input type="text" placeholder="07.10.2026" value={ctx.studyDate ?? ''} onChange={(e) => updateContext({ studyDate: e.target.value || undefined })} className={inputCls} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Перенесённая инфекция</span>
          <select className={inputCls} value={ctx.infectionPeriod} onChange={(e) => updateContext({ infectionPeriod: e.target.value as InfectionPeriod })}>
            {infectionPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Повторное исследование</span>
          <select className={inputCls} value={ctx.controlGoal ?? ''} onChange={(e) => updateContext({ controlGoal: e.target.value || undefined })}>
            <option value="">Срок не выбран</option>
            {controlGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}: {g.term}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Group title="Условия забора и события перед ним" hint="меняют вес выводов, правило 7" count={ctx.preanalytics.length}>
        <CheckList items={preanalyticItems} selected={ctx.preanalytics} onToggle={(id) => toggleInContext('preanalytics', id)} />
      </Group>
      <Group title="Клинические находки" hint="для красных флагов" count={ctx.clinicalFindings.length}>
        <CheckList items={clinicalFindings} selected={ctx.clinicalFindings} onToggle={(id) => toggleInContext('clinicalFindings', id)} />
      </Group>
      <Group title="Клиническая ситуация" hint="выделит нужные показатели" count={ctx.situations.length}>
        <CheckList items={clinicalSituations} selected={ctx.situations} onToggle={(id) => toggleInContext('situations', id)} />
      </Group>
      <Group title="Общий анализ крови" hint="НЛС и тип реакции по Гаркави" count={cbcCount}>
        <div className="grid max-w-xl gap-3 sm:grid-cols-3">
          {CBC_FIELDS.map((f) => (
            <label key={f.key} className="text-sm">
              <span className="mb-1 block text-ink-soft">
                {f.label}, {f.unit}
              </span>
              <input type="number" inputMode="decimal" step="0.01" min={0} value={ctx.cbc[f.key] ?? ''} onChange={(e) => setCbc(f.key, e.target.value)} className={inputCls} />
            </label>
          ))}
        </div>
      </Group>
    </div>
  )
}
