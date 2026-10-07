import type { CalculationResult } from '@/engine'
import { Accordion, Card } from '@/components/ui'

export function WorkupBlock({ result }: { result: CalculationResult }) {
  const { workup, cbcIndices } = result
  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">План обследования</h2>

      <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Базовый набор (7.1)</p>
      <p className="mt-1 text-sm text-ink">{workup.baseSet.join(', ')}.</p>
      <p className="mt-1 text-xs text-ink-soft">{workup.baseSetExtension}</p>

      {workup.byPattern.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">По паттернам (7.3)</p>
          <ul className="mt-1 space-y-2 text-sm text-ink">
            {workup.byPattern.map((p) => (
              <li key={p.manualNumber}>
                <span className="font-medium">
                  {p.manualNumber}. {p.name}.
                </span>{' '}
                Исключить: {p.excludeFirst}. Анализы: {p.analyses.join(', ')}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {workup.situations.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Клиническая ситуация (7.4)</p>
          {workup.situations.map((s) => (
            <div key={s.id} className="mt-2">
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {s.indicators.map((i) => (
                  <span
                    key={i.id}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      i.zoneLabel === null ? 'bg-slate-100 text-slate-500' : i.deviated ? 'bg-amber-100 text-amber-900' : 'bg-panel text-ink-soft'
                    }`}
                  >
                    {i.label}: {i.zoneLabel ?? 'не измерен'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {workup.byIndicator.length > 0 && (
        <Accordion className="mt-4" summary="По отклонённым показателям (7.2)">
          <ul className="space-y-2">
            {workup.byIndicator.map((i) => (
              <li key={i.id}>
                <span className="font-medium">
                  {i.label} ({i.zoneLabel}).
                </span>{' '}
                Первая линия: {i.firstLine.join(', ')}. По гипотезе: {i.secondLine.join(', ')}.
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {(cbcIndices.nlr || cbcIndices.garkavi) && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Индексы из ОАК (7.5)</p>
          {cbcIndices.nlr && (
            <p className="mt-1 text-sm text-ink">
              НЛС {cbcIndices.nlr.value}. {cbcIndices.nlr.interpretation}.
            </p>
          )}
          {cbcIndices.garkavi && (
            <p className="mt-1 text-sm text-ink">
              Лимфоциты {cbcIndices.garkavi.lymphocytesPct} %: {cbcIndices.garkavi.type.toLowerCase()} (по Гаркави).
            </p>
          )}
          {cbcIndices.notes.map((n) => (
            <p key={n} className="mt-1 text-xs leading-relaxed text-ink-soft">
              {n}
            </p>
          ))}
        </div>
      )}
    </Card>
  )
}
