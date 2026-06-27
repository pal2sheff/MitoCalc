import type { CalculationResult } from '@/engine'
import { Card, ConfidenceBadge, DomainCategoryBadge, OverallRiskBadge } from '@/components/ui'

export function SummaryHeader({ result }: { result: CalculationResult }) {
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <OverallRiskBadge level={result.overallRiskLevel} />
        {result.leadDomain && (
          <span className="text-sm text-ink-soft">
            Основной домен напряжения: <span className="font-medium text-ink">{result.leadDomain.label}</span>{' '}
            <DomainCategoryBadge category={result.leadDomain.category} />
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink">{result.briefConclusion}</p>

      {result.topPatterns.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {result.topPatterns.map((match) => (
            <span
              key={match.pattern.id}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs text-ink"
            >
              {match.pattern.name}
              <ConfidenceBadge confidence={match.confidence} />
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
