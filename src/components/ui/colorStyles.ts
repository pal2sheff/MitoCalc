import type { PatternConfidence, SafetyFlagLevel, ZoneColor } from '@/engine'

export interface ColorStyle {
  text: string
  bg: string
  border: string
  dot: string
}

/** Maps the engine's medical ZoneColor (derived from riskScore) to Tailwind classes. */
export const ZONE_COLOR_STYLES: Record<ZoneColor, ColorStyle> = {
  green: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  yellow: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  orange: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  red: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
}

/**
 * Confidence is "how sure are we", not "how dangerous" — deliberately styled
 * on a blue/graphite scale rather than the green-yellow-orange-red severity
 * scale used for ZoneColor, so the two concepts stay visually distinct.
 */
export const CONFIDENCE_STYLES: Record<PatternConfidence, ColorStyle> = {
  'низкая': { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', dot: 'bg-slate-400' },
  'средняя': { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  'высокая': { text: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-700' },
}

export const SAFETY_LEVEL_STYLES: Record<SafetyFlagLevel, ColorStyle> = {
  info: { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', dot: 'bg-slate-400' },
  warning: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  critical: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500' },
}

/** Нейтральная плашка: «не оценён», уровень паттерна и т. п. */
export const NEUTRAL_STYLE: ColorStyle = { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', dot: 'bg-slate-400' }
