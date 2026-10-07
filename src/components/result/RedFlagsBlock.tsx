import type { CalculationResult } from '@/engine'
import { Card } from '@/components/ui'

export function RedFlagsBlock({ result }: { result: CalculationResult }) {
  const confirmed = result.redFlags.filter((f) => f.status === 'confirmed')
  const check = result.redFlags.filter((f) => f.status === 'check')
  if (confirmed.length === 0 && check.length === 0) return null

  return (
    <div className="mb-6 space-y-3">
      {confirmed.map((f) => (
        <Card key={f.id} className="border-red-300 bg-red-50">
          <p className="text-xs font-semibold tracking-wide text-red-800 uppercase">Красный флаг</p>
          <p className="mt-1 text-sm font-medium text-red-900">{f.finding}</p>
          <p className="mt-2 text-sm text-red-900">
            <span className="font-medium">Исключить: </span>
            {f.exclude}
          </p>
          <p className="mt-1 text-sm text-red-900">
            <span className="font-medium">Действие: </span>
            {f.action}
          </p>
          <p className="mt-2 text-xs text-red-800">
            Красный флаг не отменяет остальную интерпретацию, но меняет её приоритет: сначала профильное обследование.
          </p>
        </Card>
      ))}
      {check.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">Проверьте клинику</p>
          <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
            {check.map((f) => (
              <li key={f.id}>{f.prompt}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-800">
            Если находка есть, отметьте её на экране ввода: флаг станет подтверждённым.
          </p>
        </Card>
      )}
    </div>
  )
}
