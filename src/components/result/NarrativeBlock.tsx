import type { CalculationResult } from '@/engine'
import { Card } from '@/components/ui'

export function NarrativeBlock({ result }: { result: CalculationResult }) {
  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Клиническое резюме</h2>
      <p className="text-sm leading-relaxed text-ink">{result.narrativeText}</p>
    </Card>
  )
}
