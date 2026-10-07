import type { CalculationResult } from '@/engine'
import { indicators } from '@/config'
import { Card } from '@/components/ui'

export function StudyBlock({ result }: { result: CalculationResult }) {
  const { panel, preanalytics } = result.study
  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Объём и условия исследования</h2>
      <p className="text-sm text-ink">
        <span className="font-medium">Комплектация: </span>
        {panel.label}
        {panel.detected && panel.id !== 'custom' && <span className="text-ink-soft"> (определена по введённым показателям)</span>}
      </p>
      {panel.ignoredIndicatorIds.length > 0 && (
        <p className="mt-1 text-xs text-amber-800">
          Не входят в выбранную комплектацию и в расчёт не взяты:{' '}
          {panel.ignoredIndicatorIds.map((id) => indicators[id].shortLabel).join(', ')}.
        </p>
      )}
      {panel.notes.map((n) => (
        <p key={n} className="mt-1 text-xs leading-relaxed text-ink-soft">
          {n}
        </p>
      ))}
      <p className={`mt-3 text-sm ${preanalytics.limited ? 'text-amber-900' : 'text-ink'}`}>{preanalytics.conclusionLine}</p>
    </Card>
  )
}
