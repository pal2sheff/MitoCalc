import type { CalculationResult } from '@/engine'
import { Card, RiskBadge } from '@/components/ui'

export function IndicatorTable({ result }: { result: CalculationResult }) {
  return (
    <Card className="mb-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-ink-soft uppercase">Показатели</h2>

      {result.indicatorResults.length === 0 ? (
        <p className="text-sm text-ink-soft">Показатели не введены.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="py-2 pr-3 font-medium">Показатель</th>
                <th className="py-2 pr-3 font-medium">Значение</th>
                <th className="py-2 pr-3 font-medium">Зона</th>
                <th className="py-2 font-medium">Клиническое значение</th>
              </tr>
            </thead>
            <tbody>
              {result.indicatorResults.map((r) => {
                const blank = r.zone.blankNote ?? r.definition.blankNote
                const extra = r.definition.typicalError || r.definition.temporaryFactors
                return (
                  <tr key={r.id} className="border-b border-line/60 align-top last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-ink">{r.definition.shortLabel}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">
                      {r.value} {r.definition.unit}
                    </td>
                    <td className="py-2.5 pr-3">
                      <RiskBadge riskScore={r.riskScore}>{r.zone.label}</RiskBadge>
                    </td>
                    <td className="py-2.5 text-ink-soft">
                      <p>{r.zone.meaning}</p>
                      {r.zone.firstAction && (
                        <p className="mt-1 text-ink">
                          <span className="font-medium">Первое действие: </span>
                          {r.zone.firstAction}
                        </p>
                      )}
                      {blank && <p className="mt-1 text-xs text-amber-800">{blank}</p>}
                      {extra && (
                        <details className="mt-1 text-xs">
                          <summary className="cursor-pointer text-ink-soft">Ошибки трактовки и временные влияния</summary>
                          {r.definition.typicalError && (
                            <p className="mt-1">
                              <span className="font-medium text-ink">Типичная ошибка: </span>
                              {r.definition.typicalError}
                            </p>
                          )}
                          {r.definition.temporaryFactors && (
                            <p className="mt-1">
                              <span className="font-medium text-ink">Может измениться временно: </span>
                              {r.definition.temporaryFactors}
                            </p>
                          )}
                        </details>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {result.pairHints.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Сочетания показателей (глава 3)</p>
          <p className="mt-1 text-xs text-ink-soft">Первые гипотезы для разбора. Ведущий механизм выбирается по контурам и паттернам ниже.</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink">
            {result.pairHints.map((h) => (
              <li key={h.id}>{h.text}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
