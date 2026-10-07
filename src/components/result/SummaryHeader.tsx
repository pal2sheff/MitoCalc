import type { CalculationResult } from '@/engine'
import { Card, ContourStateBadge, OverallRiskBadge } from '@/components/ui'

export function SummaryHeader({ result }: { result: CalculationResult }) {
  const lead = result.leadingContour?.contour
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <OverallRiskBadge level={result.overallRiskLevel} />
        {lead?.state && (
          <span className="text-sm text-ink-soft">
            Ведущий контур: <span className="font-medium text-ink">{lead.label}</span>{' '}
            <ContourStateBadge severity={lead.state.severity}>{lead.state.label}</ContourStateBadge>
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink">{result.briefConclusion}</p>
    </Card>
  )
}
