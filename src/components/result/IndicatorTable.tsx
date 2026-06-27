import type { CalculationResult } from '@/engine'
import { Card, RiskBadge } from '@/components/ui'

export function IndicatorTable({ result }: { result: CalculationResult }) {
  return (
    <Card className="mb-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-ink-soft uppercase">Показатели (уровень 1)</h2>

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
              {result.indicatorResults.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink">{r.definition.shortLabel}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">
                    {r.value} {r.definition.unit}
                  </td>
                  <td className="py-2.5 pr-3">
                    <RiskBadge riskScore={r.riskScore}>{r.zone.label}</RiskBadge>
                  </td>
                  <td className="py-2.5 text-ink-soft">{r.zone.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
