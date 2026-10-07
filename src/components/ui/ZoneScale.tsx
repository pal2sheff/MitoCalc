import type { IndicatorReferenceConfig, IndicatorValueType } from '@/engine'
import { riskScoreToColor } from '@/engine'
import { ZONE_HEX } from './colorStyles'

/**
 * Шкала зон, как на бланке: цветные зоны и метка значения.
 * Для проб — двусторонняя шкала вокруг нуля, отображается в пределах ±60
 * (значения за пределами прижимаются к краю, число показывается рядом).
 */
export function ZoneScale({
  value,
  config,
  valueType,
  compact = false,
}: {
  value: number | undefined
  config: IndicatorReferenceConfig
  valueType: IndicatorValueType
  compact?: boolean
}) {
  const [lo, hi] = valueType === 'deltaNadh' ? [-60, 60] : [0, 100]
  const span = hi - lo
  const clamp = (v: number) => Math.min(hi, Math.max(lo, v))
  const pos = (v: number) => ((clamp(v) - lo) / span) * 100

  const segments = config.zones
    .map((z) => ({ from: pos(z.min), to: pos(z.max === Math.floor(z.max) ? z.max : z.max + 0.1), color: ZONE_HEX[riskScoreToColor(z.riskScore)] }))
    .filter((s) => s.to > s.from)

  const h = compact ? 'h-1.5' : 'h-2'
  return (
    <div className={`relative w-full ${compact ? 'my-1' : 'my-2'}`} aria-hidden="true">
      <div className={`relative flex ${h} w-full overflow-hidden rounded-sm`}>
        {segments.map((s, i) => (
          <span
            key={i}
            style={{ position: 'absolute', left: `${s.from}%`, width: `${s.to - s.from}%`, background: s.color }}
            className="h-full border-r-2 border-paper opacity-90 last:border-r-0"
          />
        ))}
      </div>
      {valueType === 'deltaNadh' && <span className="absolute top-[-3px] left-1/2 h-[calc(100%+6px)] w-px bg-ink-soft" />}
      {value !== undefined && (
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos(value)}%` }}>
          <span className={`block rounded-full border-2 border-paper bg-ink ${compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
        </span>
      )}
    </div>
  )
}
