import type { CalculationResult } from '@/engine'
import { indicators } from '@/config'
import { Accordion, Card, ConfidenceBadge } from '@/components/ui'

export function PatternCards({ result }: { result: CalculationResult }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Клинические паттерны (уровень 3)</h2>

      {result.patternMatches.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Выраженных паттернов по введённым показателям не выявлено.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {result.patternMatches.map((match) => (
            <Card key={match.pattern.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium text-ink">{match.pattern.name}</h3>
                <ConfidenceBadge confidence={match.confidence} />
              </div>

              <p className="mt-2 text-sm leading-relaxed text-ink">{match.pattern.clinicalMeaning}</p>

              {match.triggeredIndicators.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {match.triggeredIndicators.map((t) => (
                    <span key={t.id} className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-soft">
                      {t.label}: {t.zoneLabel}
                    </span>
                  ))}
                </div>
              )}

              <Accordion className="mt-4" summary="Подробнее">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Патофизиология</dt>
                    <dd className="mt-1">{match.pattern.pathophysiology}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Возможные причины</dt>
                    <dd className="mt-1">{match.pattern.possibleCauses.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Что проверить</dt>
                    <dd className="mt-1">{match.pattern.whatToCheck.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Осторожная тактика</dt>
                    <dd className="mt-1">{match.pattern.cautiousStrategy}</dd>
                  </div>
                </dl>
              </Accordion>
            </Card>
          ))}
        </div>
      )}

      {result.notEvaluatedPatterns.length > 0 && (
        <Card className="mt-3">
          <h3 className="text-sm font-medium text-ink">Не оценены при данном объёме исследования</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Для этих паттернов не хватает измеренных показателей. Они не подтверждены и не исключены, в заключении указывается,
            что вопрос исследованием не закрыт.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink">
            {result.notEvaluatedPatterns.map((item) => (
              <li key={item.pattern.id}>
                {item.pattern.name}
                <span className="text-xs text-ink-soft">
                  {' '}
                  (нет данных: {item.missingIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
