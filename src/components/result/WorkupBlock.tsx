import type { CalculationResult } from '@/engine'
import { Accordion, Section } from '@/components/ui'

export function WorkupBlock({ result }: { result: CalculationResult }) {
  const { workup, cbcIndices } = result
  const [first, ...others] = workup.byPattern
  return (
    <Section id="workup" title="План обследования">
      <div className="grid gap-5 bg-paper p-5">
        <div>
          <p className="text-sm font-medium text-ink">Базовый набор</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{workup.baseSet.join(', ')}.</p>
        </div>
        {first && (
          <div>
            <p className="text-sm font-medium text-ink">По ведущему паттерну</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Исключить: {first.excludeFirst.charAt(0).toLowerCase() + first.excludeFirst.slice(1)}. Анализы: {first.analyses.join(', ')}.
            </p>
          </div>
        )}
        {workup.situations.map((s) => (
          <div key={s.id}>
            <p className="text-sm font-medium text-ink">{s.label}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {s.indicators.map((i, idx) => (
                <span key={i.id} className={i.deviated ? 'text-[#8a4310]' : ''}>
                  {i.label} — {i.zoneLabel ? i.zoneLabel.toLowerCase() : 'не измерен'}
                  {idx < s.indicators.length - 1 ? '; ' : '.'}
                </span>
              ))}
            </p>
          </div>
        ))}
        {(cbcIndices.nlr || cbcIndices.garkavi) && (
          <div>
            <p className="text-sm font-medium text-ink">Индексы из ОАК</p>
            {cbcIndices.nlr && <p className="mt-1 text-sm text-ink">НЛС {cbcIndices.nlr.value}: {cbcIndices.nlr.interpretation.charAt(0).toLowerCase() + cbcIndices.nlr.interpretation.slice(1)}.</p>}
            {cbcIndices.garkavi && <p className="mt-1 text-sm text-ink">Лимфоциты {cbcIndices.garkavi.lymphocytesPct} %: {cbcIndices.garkavi.type.toLowerCase()} по Гаркави.</p>}
            {cbcIndices.notes.slice(2).map((n) => (
              <p key={n} className="mt-1 text-sm text-[#8a4310]">
                {n}
              </p>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {others.length > 0 && (
            <Accordion summary={`По остальным паттернам: ${others.length}`}>
              <ul className="grid gap-1.5">
                {others.map((p) => (
                  <li key={p.manualNumber}>
                    {p.manualNumber}. {p.name}: исключить {p.excludeFirst.charAt(0).toLowerCase() + p.excludeFirst.slice(1)}; {p.analyses.join(', ')}.
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          {workup.byIndicator.length > 0 && (
            <Accordion summary={`По отклонённым показателям: ${workup.byIndicator.length}`}>
              <ul className="grid gap-1.5">
                {workup.byIndicator.map((i) => (
                  <li key={i.id}>
                    {i.label}: {i.firstLine.join(', ')}; по гипотезе — {i.secondLine.join(', ')}.
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          <Accordion summary="Расширение по гипотезе">{workup.baseSetExtension}</Accordion>
        </div>
      </div>
    </Section>
  )
}
