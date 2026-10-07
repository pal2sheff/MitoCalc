import type { CalculationResult, IndicatorResult } from '@/engine'
import { riskScoreToColor } from '@/engine'
import { referenceRanges } from '@/config'
import { Accordion, Section, ZONE_COLOR_STYLES, ZoneScale } from '@/components/ui'

function Row({ r }: { r: IndicatorResult }) {
  const style = ZONE_COLOR_STYLES[riskScoreToColor(r.riskScore)]
  const blank = r.zone.blankNote ?? r.definition.blankNote
  const value = r.definition.valueType === 'deltaNadh' ? (r.value > 0 ? `+${r.value}` : r.value < 0 ? `−${Math.abs(r.value)}` : '0') : `${r.value} %`

  return (
    <details className="group border-b border-line-soft last:border-0">
      <summary className="grid cursor-pointer grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-4 py-3 select-none sm:grid-cols-[minmax(0,14rem)_4.5rem_minmax(0,1fr)_10rem]">
        <span className="flex items-center gap-1.5 text-sm text-ink">
          <svg className="h-3 w-3 shrink-0 text-ink-faint transition-transform group-open:rotate-90" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M7.5 5 12.5 10 7.5 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {r.definition.shortLabel}
          {blank && <span className="h-1.5 w-1.5 rounded-full bg-zone-mild" title="Есть замечание к формулировке бланка" />}
        </span>
        <span className="text-right text-[15px] font-medium text-ink">{value}</span>
        <span className="col-span-2 sm:col-span-1">
          <ZoneScale value={r.value} config={referenceRanges[r.id]} valueType={r.definition.valueType} />
        </span>
        <span className={`col-span-2 text-sm sm:col-span-1 ${style.text}`}>{r.zone.label}</span>
      </summary>
      <div className="grid gap-1.5 pb-4 pl-5 text-sm leading-relaxed text-ink-soft sm:max-w-3xl">
        <p className="text-ink">{r.zone.meaning}</p>
        {r.zone.firstAction && <p>Первое действие: {r.zone.firstAction}</p>}
        {blank && <p className="text-[#6e5310]">{blank}</p>}
        {r.definition.typicalError && <p>Типичная ошибка: {r.definition.typicalError}</p>}
        {r.definition.temporaryFactors && <p>Может измениться временно: {r.definition.temporaryFactors}</p>}
      </div>
    </details>
  )
}

export function IndicatorTable({ result }: { result: CalculationResult }) {
  const base = result.indicatorResults.filter((r) => r.definition.valueType !== 'deltaNadh')
  const probes = result.indicatorResults.filter((r) => r.definition.valueType === 'deltaNadh')
  return (
    <Section id="indicators" title="Показатели" aside="нажмите на строку, чтобы раскрыть пояснение">
      <div className="bg-paper px-4 sm:px-5">
        {base.map((r) => (
          <Row key={r.id} r={r} />
        ))}
      </div>
      {probes.length > 0 && (
        <>
          <p className="mt-5 mb-1 text-sm text-ink-soft">Функциональные пробы, ΔНАДН</p>
          <div className="bg-paper px-4 sm:px-5">
            {probes.map((r) => (
              <Row key={r.id} r={r} />
            ))}
          </div>
        </>
      )}
      {result.pairHints.length > 0 && (
        <Accordion className="mt-4" summary={`Сочетания показателей: ${result.pairHints.length}`}>
          <ul className="grid gap-1.5">
            {result.pairHints.map((h) => (
              <li key={h.id}>{h.text}</li>
            ))}
          </ul>
        </Accordion>
      )}
    </Section>
  )
}
