import type { CalculationResult } from '@/engine'
import { indicators } from '@/config'
import { Badge, Card, ContourStateBadge, NEUTRAL_STYLE } from '@/components/ui'

export function ContourCards({ result }: { result: CalculationResult }) {
  const leadId = result.leadingContour?.contour.id

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Функциональные контуры</h2>

      {result.leadingContour && (
        <Card className="mb-3">
          <p className="text-sm text-ink">
            <span className="font-medium">Ведущий контур: {result.leadingContour.contour.label}.</span>{' '}
            {result.leadingContour.reason}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">Направление поиска: </span>
            {result.leadingContour.contour.searchDirection}
          </p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {result.contourResults.map((contour) => (
          <Card key={contour.id} className={contour.id === leadId ? 'ring-2 ring-blue-200' : ''}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-ink">{contour.label}</h3>
              {contour.state ? (
                <ContourStateBadge severity={contour.state.severity}>{contour.state.label}</ContourStateBadge>
              ) : (
                <Badge style={NEUTRAL_STYLE}>не оценён</Badge>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{contour.question}</p>

            {contour.state ? (
              <p className="mt-3 text-sm leading-relaxed text-ink">{contour.state.text}</p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink">
                Контур не собирается: объём исследования не включает необходимые показатели. Неизмеренное не означает
                сохранного.
              </p>
            )}

            {contour.notes.map((note) => (
              <p key={note} className="mt-2 text-sm leading-relaxed text-amber-800">
                {note}
              </p>
            ))}

            {contour.deviatedIndicators.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {contour.deviatedIndicators.map((d) => (
                  <span key={d.id} className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-soft">
                    {d.label}: {d.zoneLabel}
                  </span>
                ))}
              </div>
            )}

            {contour.status === 'оценён частично' && (
              <p className="mt-3 text-xs text-ink-soft">
                Оценка частичная, нет данных: {contour.missingIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')}.
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
