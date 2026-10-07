import type { IndicatorDefinition } from '@/engine'
import { getZone, normalizeIndicator, riskScoreToColor } from '@/engine'
import { referenceRanges } from '@/config'
import { ZONE_COLOR_STYLES, ZoneScale } from '@/components/ui'

/** Строка ввода: название, число, живая шкала зон и название зоны. */
export function IndicatorField({
  definition,
  value,
  imported = false,
  onChange,
}: {
  definition: IndicatorDefinition
  value: number | undefined
  imported?: boolean
  onChange: (rawValue: string) => void
}) {
  const normalized = normalizeIndicator(value, definition)
  const zone = normalized !== null ? getZone(normalized, referenceRanges[definition.id]) : null
  const style = zone ? ZONE_COLOR_STYLES[riskScoreToColor(zone.riskScore)] : null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-x-4 gap-y-1 border-b border-line-soft py-3 last:border-0 sm:grid-cols-[minmax(0,15rem)_6.5rem_minmax(0,1fr)_9rem]">
      <label htmlFor={definition.id} className="text-sm text-ink" title={definition.hint}>
        {definition.label}
      </label>
      <div className="relative">
        <input
          id={definition.id}
          type="number"
          inputMode="decimal"
          min={definition.min}
          max={definition.max}
          step={definition.step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded border py-1.5 pr-7 pl-2.5 text-right text-sm text-ink focus:border-brand focus:outline-none ${imported ? 'border-[#aebde3] bg-brand-tint' : 'border-line bg-paper'}`}
          title={imported ? 'Внесено из PDF' : undefined}
          aria-describedby={`${definition.id}-zone`}
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-ink-faint">
          {definition.valueType === 'deltaNadh' ? 'Δ' : '%'}
        </span>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <ZoneScale value={normalized ?? undefined} config={referenceRanges[definition.id]} valueType={definition.valueType} compact />
      </div>
      <span id={`${definition.id}-zone`} className={`col-span-2 text-xs sm:col-span-1 ${style ? style.text : 'text-ink-faint'}`}>
        {zone ? zone.label : 'не введён'}
      </span>
    </div>
  )
}
