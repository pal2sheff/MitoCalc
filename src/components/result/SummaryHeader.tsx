import type { CalculationResult } from '@/engine'
import { indicators } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Accordion, ContourStateBadge, OverallRiskBadge } from '@/components/ui'

/** Паспорт исследования и главный вывод: то, что врач читает первым. */
export function SummaryHeader({ result }: { result: CalculationResult }) {
  const { priorityContext } = useMitoPassport()
  const { panel, preanalytics } = result.study
  const lead = result.priority.leading
  const contour = result.leadingContour?.contour

  return (
    <section id="summary" className="scroll-mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Результат интерпретации</h1>
        <p className="text-sm text-ink-soft">
          {[priorityContext.studyDate, panel.label, preanalytics.limited ? 'условия забора с ограничениями' : 'условия забора без особенностей']
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          {lead ? (
            <>
              <p className="text-sm text-brand">Ведущий паттерн</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
                {lead.pattern.manualNumber}. {lead.pattern.name}
              </p>
              {lead.subtype && <p className="mt-1 text-sm text-ink-soft">{lead.subtype}</p>}
              <p className="mt-3 font-serif text-[15px] leading-relaxed text-ink">{lead.pattern.conclusionLine}</p>
            </>
          ) : (
            <p className="font-serif text-[15px] leading-relaxed text-ink">{result.priority.leadingReason}</p>
          )}
          {result.priority.unconfirmedSystemic.length > 0 && lead?.pattern.level !== 'A' && (
            <p className="mt-2 text-sm text-ink-soft">Системный контекст клиникой не подтверждён.</p>
          )}
        </div>

        <dl className="grid content-start gap-4 border-line md:border-l md:pl-6">
          <div>
            <dt className="text-xs text-ink-soft">Ведущий контур</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink">
              {contour?.state ? (
                <>
                  {contour.label.replace(/[- ]контур$/, '')}
                  <ContourStateBadge severity={contour.state.severity}>{contour.state.label.toLowerCase()}</ContourStateBadge>
                </>
              ) : (
                <span className="text-ink-soft">изменённых контуров нет</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Степень изменений</dt>
            <dd className="mt-1">
              <OverallRiskBadge level={result.overallRiskLevel} />
            </dd>
          </div>
          {contour && (
            <div>
              <dt className="text-xs text-ink-soft">Направление поиска</dt>
              <dd className="mt-1 text-sm leading-snug text-ink">{contour.searchDirection}</dd>
            </div>
          )}
        </dl>
      </div>

      {(panel.notes.length > 0 || preanalytics.limited || panel.ignoredIndicatorIds.length > 0 || result.safetyFlags.length > 0) && (
        <Accordion className="mt-5" summary="Ограничения этого исследования">
          <ul className="grid gap-1.5">
            {preanalytics.limited && <li>{preanalytics.conclusionLine}</li>}
            {panel.ignoredIndicatorIds.length > 0 && (
              <li>Не входят в комплектацию и не учтены: {panel.ignoredIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')}.</li>
            )}
            {panel.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
            {result.safetyFlags.map((f) => (
              <li key={f.id} className={f.level === 'critical' ? 'text-[#7a1f24]' : ''}>
                {f.text}
              </li>
            ))}
          </ul>
        </Accordion>
      )}
    </section>
  )
}
