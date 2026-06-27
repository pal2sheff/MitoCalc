import type { IndicatorDefinition } from '@/engine'

export function IndicatorField({
  definition,
  value,
  onChange,
}: {
  definition: IndicatorDefinition
  value: number | undefined
  onChange: (rawValue: string) => void
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={definition.id} className="text-sm font-medium text-ink">
          {definition.label}
        </label>
        <span className="shrink-0 text-xs text-ink-soft">{definition.unit}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{definition.hint}</p>
      <input
        id={definition.id}
        type="number"
        inputMode="decimal"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${definition.min}…${definition.max}`}
        className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
      />
    </div>
  )
}
