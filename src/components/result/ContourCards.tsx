import type { CalculationResult } from '@/engine'
import { contourSeverityToColor } from '@/engine'
import { indicators } from '@/config'
import { Section, ZONE_HEX } from '@/components/ui'

export function ContourCards({ result }: { result: CalculationResult }) {
  const leadId = result.leadingContour?.contour.id
  return (
    <Section id="contours" title="Функциональные контуры" aside={result.leadingContour ? `ведущий: ${result.leadingContour.contour.label.replace(/[- ]контур$/, '').toLowerCase()}` : undefined}>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {result.contourResults.map((c) => {
          const color = c.state ? ZONE_HEX[contourSeverityToColor(c.state.severity)] : '#c6ced4'
          return (
            <details key={c.id} className="group bg-paper">
              <summary className="flex h-full cursor-pointer gap-3 p-4 select-none">
                <span className="w-1 shrink-0 self-stretch" style={{ background: color }} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xs text-ink-soft">
                    {c.label.replace(/[- ]контур$/, '')}
                    {c.id === leadId && <span className="rounded bg-brand-tint px-1.5 text-brand">ведущий</span>}
                  </span>
                  <span className={`mt-0.5 block text-[15px] font-medium ${c.state ? 'text-ink' : 'text-ink-faint'}`}>
                    {c.state ? c.state.label : 'Не оценён'}
                  </span>
                  {c.status === 'оценён частично' && <span className="text-xs text-ink-faint">оценка частичная</span>}
                </span>
              </summary>
              <div className="grid gap-2 px-4 pb-4 pl-8 text-sm leading-relaxed text-ink-soft">
                <p className="text-ink">{c.state ? c.state.text : 'Объём исследования не включает нужные показатели. Неизмеренное не означает сохранного.'}</p>
                {c.notes.map((n) => (
                  <p key={n} className="text-[#8a4310]">
                    {n}
                  </p>
                ))}
                {c.deviatedIndicators.length > 0 && <p>Отклонены: {c.deviatedIndicators.map((d) => `${d.label} (${d.zoneLabel.toLowerCase()})`).join(', ')}.</p>}
                {c.missingIndicatorIds.length > 0 && c.state && <p>Нет данных: {c.missingIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')}.</p>}
                <p className="text-xs">{c.question}</p>
              </div>
            </details>
          )
        })}
      </div>
      {result.leadingContour && <p className="mt-3 text-sm text-ink-soft">{result.leadingContour.reason}</p>}
    </Section>
  )
}
