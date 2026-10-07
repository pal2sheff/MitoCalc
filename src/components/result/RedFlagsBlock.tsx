import type { CalculationResult } from '@/engine'

export function RedFlagsBlock({ result }: { result: CalculationResult }) {
  const confirmed = result.redFlags.filter((f) => f.status === 'confirmed')
  const check = result.redFlags.filter((f) => f.status === 'check')
  if (confirmed.length === 0 && check.length === 0) return null

  return (
    <div className="mb-8 grid gap-3">
      {confirmed.map((f) => (
        <div key={f.id} className="border-l-4 border-zone-severe bg-[#f8e3e3] px-5 py-4 text-[#5e1519]">
          <p className="text-sm font-semibold">Красный флаг: сначала профильное обследование</p>
          <p className="mt-1 text-sm">{f.finding}.</p>
          <p className="mt-2 text-sm">
            Исключить: {f.exclude.toLowerCase()}. Действие: {f.action.toLowerCase()}.
          </p>
        </div>
      ))}
      {check.length > 0 && (
        <div className="border-l-4 border-zone-mild bg-[#fbf2d9] px-5 py-3 text-[#5a430b]">
          <p className="text-sm font-medium">Проверьте клинику</p>
          <ul className="mt-1 grid gap-1 text-sm">
            {check.map((f) => (
              <li key={f.id}>{f.prompt}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs">Если находка есть, отметьте её на экране ввода — флаг станет подтверждённым.</p>
        </div>
      )}
    </div>
  )
}
