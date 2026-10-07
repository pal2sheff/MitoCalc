import type { CbcInputs, InfectionPeriod } from '@/engine'
import { clinicalFindings, clinicalSituations, controlGoals, infectionPeriods, preanalyticItems } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Card } from '@/components/ui'

function CheckList({
  items,
  selected,
  onToggle,
}: {
  items: { id: string; label: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-start gap-2 text-sm text-ink">
          <input className="mt-1" type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  )
}

const CBC_FIELDS: { key: keyof CbcInputs; label: string; unit: string }[] = [
  { key: 'neutrophilsAbs', label: 'Нейтрофилы, абсолютное число', unit: '×10⁹/л' },
  { key: 'lymphocytesAbs', label: 'Лимфоциты, абсолютное число', unit: '×10⁹/л' },
  { key: 'lymphocytesPct', label: 'Лимфоциты в лейкоформуле', unit: '%' },
]

export function ClinicalContextForm() {
  const { priorityContext: ctx, updateContext, toggleInContext } = useMitoPassport()

  function setCbc(key: keyof CbcInputs, raw: string) {
    const next = { ...ctx.cbc }
    const v = Number.parseFloat(raw.replace(',', '.'))
    if (raw.trim() === '' || !Number.isFinite(v)) delete next[key]
    else next[key] = v
    updateContext({ cbc: next })
  }

  return (
    <section className="mb-10 space-y-4">
      <h2 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Условия исследования и клинический контекст</h2>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-ink">
            <span className="mb-1 block font-medium">Дата исследования</span>
            <input
              type="text"
              placeholder="например, 07.10.2026"
              value={ctx.studyDate ?? ''}
              onChange={(e) => updateContext({ studyDate: e.target.value || undefined })}
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-ink">
            <span className="mb-1 block font-medium">Цель повторного исследования (срок по разделу 8.3)</span>
            <select
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
              value={ctx.controlGoal ?? ''}
              onChange={(e) => updateContext({ controlGoal: e.target.value || undefined })}
            >
              <option value="">Не выбрана</option>
              {controlGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}: {g.term}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 font-medium text-ink">Условия забора и события предшествующих недель</h3>
        <p className="mb-3 text-xs text-ink-soft">
          Вносятся в заключение отдельной строкой и меняют вес всех выводов. Отмеченные события подсказывают, какие паттерны могут
          быть ими объяснены (правило 7).
        </p>
        <CheckList items={preanalyticItems} selected={ctx.preanalytics} onToggle={(id) => toggleInContext('preanalytics', id)} />
        <label className="mt-4 block text-sm text-ink">
          <span className="mb-1 block font-medium">Перенесённая инфекция (стадия паттерна 14)</span>
          <select
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            value={ctx.infectionPeriod}
            onChange={(e) => updateContext({ infectionPeriod: e.target.value as InfectionPeriod })}
          >
            {infectionPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <Card>
        <h3 className="mb-1 font-medium text-ink">Клинические находки</h3>
        <p className="mb-3 text-xs text-ink-soft">Нужны для проверки красных флагов (раздел 9.3).</p>
        <CheckList items={clinicalFindings} selected={ctx.clinicalFindings} onToggle={(id) => toggleInContext('clinicalFindings', id)} />
      </Card>

      <Card>
        <h3 className="mb-1 font-medium text-ink">Клиническая ситуация</h3>
        <p className="mb-3 text-xs text-ink-soft">Калькулятор выделит наиболее информативные для неё показатели (таблица 7.4).</p>
        <CheckList items={clinicalSituations} selected={ctx.situations} onToggle={(id) => toggleInContext('situations', id)} />
      </Card>

      <Card>
        <h3 className="mb-1 font-medium text-ink">Общий анализ крови</h3>
        <p className="mb-3 text-xs text-ink-soft">
          Необязательно. Для расчёта нейтрофильно-лимфоцитарного соотношения и типа реакции по Гаркави (раздел 7.5).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {CBC_FIELDS.map((f) => (
            <label key={f.key} className="text-sm text-ink">
              <span className="mb-1 block">
                {f.label}, <span className="text-ink-soft">{f.unit}</span>
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={ctx.cbc[f.key] ?? ''}
                onChange={(e) => setCbc(f.key, e.target.value)}
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      </Card>
    </section>
  )
}
