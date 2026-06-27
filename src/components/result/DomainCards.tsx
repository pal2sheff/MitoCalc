import type { CalculationResult } from '@/engine'
import { Card, DomainCategoryBadge } from '@/components/ui'

export function DomainCards({ result }: { result: CalculationResult }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Клинические домены (уровень 2)</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {result.domainResults.map((domain) => (
          <Card key={domain.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-ink">{domain.label}</h3>
              <DomainCategoryBadge category={domain.category} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{domain.description}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{domain.interpretation}</p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">Следующий шаг: </span>
              {domain.nextStep}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
