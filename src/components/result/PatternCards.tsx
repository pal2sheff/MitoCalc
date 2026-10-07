import type { CalculationResult, PatternMatch } from '@/engine'
import { indicators } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Accordion, Section } from '@/components/ui'

const LEVEL: Record<string, string> = {
  A: 'системный контекст',
  B: 'функциональный контур',
  C: 'уровень ограничения',
  D: 'компенсация',
  E: 'сохранный профиль',
}

function Controls({ match, hint }: { match: PatternMatch; hint?: string[] }) {
  const { priorityContext, toggleConfirmedSystemic, toggleExplainedByEvent } = useMitoPassport()
  const p = match.pattern
  const explained = priorityContext.explainedByEvent.includes(p.id)
  return (
    <div className="no-print grid gap-1.5 text-sm text-ink">
      {p.level === 'A' && (
        <label className="flex items-start gap-2">
          <input className="mt-0.5 h-4 w-4" type="checkbox" checked={priorityContext.confirmedSystemic.includes(p.id)} onChange={() => toggleConfirmedSystemic(p.id)} />
          Подтверждается клиникой
        </label>
      )}
      <label className="flex items-start gap-2">
        <input className="mt-0.5 h-4 w-4" type="checkbox" checked={explained} onChange={() => toggleExplainedByEvent(p.id)} />
        Объясняется недавним событием или условиями забора
      </label>
      {hint && hint.length > 0 && !explained && <p className="text-xs text-[#8a4310]">Возможное объяснение: {hint.join('; ').toLowerCase()}.</p>}
    </div>
  )
}

const strategy = (s: string) => s.replace(/^Приоритет\s*[—-]\s*/, '').replace(/^./, (c) => c.toUpperCase())

function Details({ match, collapsed = false }: { match: PatternMatch; collapsed?: boolean }) {
  const p = match.pattern
  const more = (
    <>
      <p>Механизм: {p.pathophysiology}</p>
      <p>Исключить прежде всего: {p.excludeFirst.charAt(0).toLowerCase() + p.excludeFirst.slice(1)}.</p>
      <p>Ключевые анализы: {p.whatToCheck.join(', ')}.</p>
      {match.triggeredIndicators.length > 0 && <p className="text-xs">Основание: {match.triggeredIndicators.map((t) => `${t.label} (${t.zoneLabel.toLowerCase()})`).join(', ')}.</p>}
    </>
  )
  return (
    <div className="grid gap-2 text-sm leading-relaxed text-ink-soft">
      <p className="text-ink">{p.clinicalMeaning}</p>
      <p>Приоритет действий: {strategy(p.cautiousStrategy)}</p>
      {collapsed ? <Accordion summary="Механизм, что исключить, анализы">{<div className="grid gap-2">{more}</div>}</Accordion> : more}
    </div>
  )
}

export function PatternCards({ result }: { result: CalculationResult }) {
  const { priority } = result
  const hints = (id: string) => result.study.preanalytics.rule7Hints.find((h) => h.patternId === id)?.reasons
  const lead = priority.leading
  const rest = [...priority.manifestations, ...priority.explainedByEvent]

  return (
    <Section id="patterns" title="Паттерны" aside={`активно: ${result.patternMatches.length}`}>
      {lead && (
        <div className="border border-line border-t-[3px] border-t-brand bg-paper p-5">
          <p className="text-sm text-brand">
            Ведущий · уровень {lead.pattern.level}, {LEVEL[lead.pattern.level]}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink">
            {lead.pattern.manualNumber}. {lead.pattern.name}
          </p>
          {lead.subtype && <p className="mt-0.5 text-sm text-ink-soft">{lead.subtype}</p>}
          <div className="mt-3">
            <Details match={lead} collapsed />
          </div>
          <div className="mt-4 border-t border-line-soft pt-3">
            <Controls match={lead} hint={hints(lead.pattern.id)} />
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-4 bg-paper px-4 sm:px-5">
          {rest.map((m) => {
            const explained = priority.explainedByEvent.includes(m)
            return (
              <details key={m.pattern.id} className={`group border-b border-line-soft last:border-0 ${explained ? 'opacity-60' : ''}`}>
                <summary className="flex cursor-pointer items-baseline gap-3 py-3 select-none">
                  <svg className="h-3 w-3 shrink-0 self-center text-ink-faint transition-transform group-open:rotate-90" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M7.5 5 12.5 10 7.5 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="w-6 shrink-0 text-sm text-ink-faint">{m.pattern.manualNumber}</span>
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {m.pattern.name}
                    {m.subtype && <span className="text-ink-soft"> — {m.subtype.charAt(0).toLowerCase() + m.subtype.slice(1)}</span>}
                  </span>
                  <span className="hidden shrink-0 text-xs text-ink-faint sm:inline">
                    {explained ? 'объяснён событием' : `${m.pattern.level}, ${LEVEL[m.pattern.level]}`}
                  </span>
                  {hints(m.pattern.id) && !explained && <span className="h-1.5 w-1.5 shrink-0 self-center rounded-full bg-zone-moderate" title="Может объясняться событием" />}
                </summary>
                <div className="grid gap-3 pb-4 pl-12">
                  <Details match={m} />
                  <Controls match={m} hint={hints(m.pattern.id)} />
                </div>
              </details>
            )
          })}
        </div>
      )}

      {!lead && rest.length === 0 && <p className="bg-paper p-5 text-sm text-ink-soft">Активированных паттернов нет.</p>}

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <Accordion summary="Как выбран ведущий">
          <p>{priority.leadingReason}</p>
          {priority.appliedRules.length > 0 && (
            <ul className="mt-2 grid gap-1">
              {priority.appliedRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </Accordion>
        {result.notEvaluatedPatterns.length > 0 && (
          <Accordion summary={`Не оценены: ${result.notEvaluatedPatterns.length}`}>
            <p>Не хватает измеренных показателей: паттерны не подтверждены и не исключены.</p>
            <ul className="mt-2 grid gap-1">
              {result.notEvaluatedPatterns.map((n) => (
                <li key={n.pattern.id}>
                  {n.pattern.manualNumber}. {n.pattern.name} — нет: {n.missingIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')}
                </li>
              ))}
            </ul>
          </Accordion>
        )}
      </div>
    </Section>
  )
}
