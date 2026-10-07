import type { CalculationResult, PatternMatch } from '@/engine'
import { indicators } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Accordion, Badge, Card, ConfidenceBadge, NEUTRAL_STYLE } from '@/components/ui'

const LEVEL_LABEL: Record<string, string> = {
  A: 'A · системный контекст',
  B: 'B · функциональный контур',
  C: 'C · уровень ограничения',
  D: 'D · компенсация',
  E: 'E · сохранный профиль',
}

function PatternCard({ match, isLeading, hint }: { match: PatternMatch; isLeading: boolean; hint?: string[] }) {
  const { priorityContext, toggleConfirmedSystemic, toggleExplainedByEvent } = useMitoPassport()
  const p = match.pattern
  const confirmed = priorityContext.confirmedSystemic.includes(p.id)
  const explained = priorityContext.explainedByEvent.includes(p.id)

  return (
    <Card className={isLeading ? 'ring-2 ring-blue-300' : explained ? 'opacity-60' : ''}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-ink">
          {isLeading && <span className="mr-2 text-blue-700">Ведущий ·</span>}
          {p.manualNumber}. {p.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge style={NEUTRAL_STYLE}>{LEVEL_LABEL[p.level]}</Badge>
          <ConfidenceBadge confidence={match.confidence} />
        </div>
      </div>

      {match.subtype && <p className="mt-2 text-sm font-medium text-ink">{match.subtype}</p>}
      <p className="mt-2 text-sm leading-relaxed text-ink">{p.clinicalMeaning}</p>

      {match.triggeredIndicators.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {match.triggeredIndicators.map((t) => (
            <span key={t.id} className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-soft">
              {t.label}: {t.zoneLabel}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink">
        {p.level === 'A' && (
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={confirmed} onChange={() => toggleConfirmedSystemic(p.id)} />
            Подтверждается клиникой (правило 8)
          </label>
        )}
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={explained} onChange={() => toggleExplainedByEvent(p.id)} />
          Объясняется недавним событием или условиями забора (правило 7)
        </label>
      </div>
      {hint && hint.length > 0 && !explained && (
        <p className="mt-2 text-xs text-amber-800">Может объясняться отмеченным событием: {hint.join('; ').toLowerCase()}. Проверьте правило 7.</p>
      )}

      <Accordion className="mt-4" summary="Подробнее">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Строка для заключения</dt>
            <dd className="mt-1">{p.conclusionLine}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Механизм</dt>
            <dd className="mt-1">{p.pathophysiology}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Возможные причины</dt>
            <dd className="mt-1">{p.possibleCauses.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Ключевые анализы</dt>
            <dd className="mt-1">{p.whatToCheck.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Приоритет действий</dt>
            <dd className="mt-1">{p.cautiousStrategy}</dd>
          </div>
        </dl>
      </Accordion>
    </Card>
  )
}

export function PatternCards({ result }: { result: CalculationResult }) {
  const { priority } = result
  const ordered = [
    ...(priority.leading ? [priority.leading] : []),
    ...priority.manifestations,
    ...priority.explainedByEvent,
  ]

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Паттерны</h2>

      <Card className="mb-3">
        <p className="text-sm leading-relaxed text-ink">{priority.leadingReason}</p>
        {priority.appliedRules.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-ink-soft">
            {priority.appliedRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        )}
      </Card>

      {ordered.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Активированных паттернов по введённым показателям нет.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {ordered.map((match) => (
            <PatternCard
              key={match.pattern.id}
              match={match}
              isLeading={match === priority.leading}
              hint={result.study.preanalytics.rule7Hints.find((h) => h.patternId === match.pattern.id)?.reasons}
            />
          ))}
        </div>
      )}

      {result.notEvaluatedPatterns.length > 0 && (
        <Card className="mt-3">
          <h3 className="text-sm font-medium text-ink">Не оценены при данном объёме исследования</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Для этих паттернов не хватает измеренных показателей. Они не подтверждены и не исключены (правило 6).
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink">
            {result.notEvaluatedPatterns.map((item) => (
              <li key={item.pattern.id}>
                {item.pattern.manualNumber}. {item.pattern.name}
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
