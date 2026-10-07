import type { DynamicsResult } from '@/engine'
import { Accordion, Card } from '@/components/ui'

const CHECK_LABEL = (v: boolean | null, yes: string, no: string) => (v === null ? 'не оценено' : v ? yes : no)

export function DynamicsBlock({ dynamics }: { dynamics: DynamicsResult }) {
  const significant = dynamics.indicatorChanges.filter((c) => c.kind !== 'withinZone')
  const within = dynamics.indicatorChanges.filter((c) => c.kind === 'withinZone')

  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Динамика</h2>

      {dynamics.progressiveWorsening && (
        <p className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          Красный флаг: прогрессирующее ухудшение всех контуров при адекватном лечении. Исключить недиагностированное системное
          заболевание; пересмотр диагностической гипотезы, расширение обследования.
        </p>
      )}

      <p className="text-base font-medium text-ink">{dynamics.type}</p>
      <p className="mt-1 text-sm text-ink">{dynamics.meaning}</p>
      <p className="mt-1 text-sm text-ink">
        <span className="font-medium">Тактика: </span>
        {dynamics.tactics}
      </p>

      {dynamics.notes.map((n) => (
        <p key={n} className="mt-2 text-xs text-amber-800">
          {n}
        </p>
      ))}
      {!dynamics.comparable && (
        <p className="mt-1 text-xs text-ink-soft">Не воспроизведено: {dynamics.notReproduced.join('; ').toLowerCase()}.</p>
      )}

      {dynamics.traps.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">Показатель улучшился, контур — нет (8.5)</p>
          <ul className="mt-1 space-y-1 text-sm text-amber-900">
            {dynamics.traps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-2 text-sm text-ink sm:grid-cols-3">
        <p>Компенсация: {CHECK_LABEL(dynamics.checks.compensationGrew, 'выросла', 'не выросла')}</p>
        <p>Редокс- или кальциевый фон: {CHECK_LABEL(dynamics.checks.backgroundGrew, 'вырос', 'не вырос')}</p>
        <p>Проба на стресс: {CHECK_LABEL(dynamics.checks.stressProbeImproved, 'улучшилась', 'не улучшилась')}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Контуры</p>
        <ul className="mt-1 space-y-1 text-sm text-ink">
          {dynamics.contourChanges.map((c) => (
            <li key={c.id}>
              {c.label}: {c.stateBefore ?? 'не оценён'} → {c.stateAfter ?? 'не оценён'}
              {c.direction === 'improved' && ' — улучшение'}
              {c.direction === 'worsened' && ' — ухудшение'}
              {c.coordinatedShift === 'toward' && ' (согласованный сдвиг к целевым зонам)'}
              {c.coordinatedShift === 'away' && ' (согласованный сдвиг от целевых зон)'}
            </li>
          ))}
        </ul>
      </div>

      {significant.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Значимые изменения показателей</p>
          <ul className="mt-1 space-y-1 text-sm text-ink">
            {significant.map((c) => (
              <li key={c.id}>
                {c.label}: {c.before} → {c.after} ({c.zoneBefore.toLowerCase()} → {c.zoneAfter.toLowerCase()})
                {c.kind === 'signChange' && ', смена знака'}
                {c.direction === 'toward' && ', к целевой зоне'}
                {c.direction === 'away' && ', от целевой зоны'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {within.length > 0 && (
        <Accordion className="mt-4" summary={`Изменения внутри зоны: ${within.length} (не интерпретируются)`}>
          <ul className="space-y-1">
            {within.map((c) => (
              <li key={c.id}>
                {c.label}: {c.before} → {c.after} ({c.zoneAfter.toLowerCase()})
              </li>
            ))}
          </ul>
        </Accordion>
      )}
    </Card>
  )
}
