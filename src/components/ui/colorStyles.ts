import type { PatternConfidence, SafetyFlagLevel, ZoneColor } from '@/engine'

export interface ColorStyle {
  text: string
  bg: string
  border: string
  dot: string
}

/** Цвета зон бланка: зелёный — цель, жёлтый и оранжевый — умеренно, красный — выраженно. */
export const ZONE_HEX: Record<ZoneColor, string> = {
  green: '#2f8f6b',
  yellow: '#e2b33c',
  orange: '#e5853b',
  red: '#c0393b',
}

export const ZONE_COLOR_STYLES: Record<ZoneColor, ColorStyle> = {
  green: { text: 'text-[#1d5c44]', bg: 'bg-[#e2f1ea]', border: 'border-[#bfe0d1]', dot: 'bg-zone-target' },
  yellow: { text: 'text-[#6e5310]', bg: 'bg-[#fbf2d9]', border: 'border-[#efdca4]', dot: 'bg-zone-mild' },
  orange: { text: 'text-[#8a4310]', bg: 'bg-[#fbebdd]', border: 'border-[#f2cba9]', dot: 'bg-zone-moderate' },
  red: { text: 'text-[#7a1f24]', bg: 'bg-[#f8e3e3]', border: 'border-[#ebbcbc]', dot: 'bg-zone-severe' },
}

/** Уверенность — «насколько полно совпала формула», а не тяжесть: нейтральная шкала. */
export const CONFIDENCE_STYLES: Record<PatternConfidence, ColorStyle> = {
  'низкая': { text: 'text-ink-soft', bg: 'bg-panel', border: 'border-line', dot: 'bg-ink-faint' },
  'средняя': { text: 'text-brand', bg: 'bg-brand-tint', border: 'border-[#c9d4ec]', dot: 'bg-brand' },
  'высокая': { text: 'text-brand-dark', bg: 'bg-brand-tint', border: 'border-[#aebde3]', dot: 'bg-brand-dark' },
}

export const SAFETY_LEVEL_STYLES: Record<SafetyFlagLevel, ColorStyle> = {
  info: { text: 'text-ink-soft', bg: 'bg-panel', border: 'border-line', dot: 'bg-ink-faint' },
  warning: ZONE_COLOR_STYLES.orange,
  critical: ZONE_COLOR_STYLES.red,
}

/** Нейтральная плашка: «не оценён», уровень паттерна и т. п. */
export const NEUTRAL_STYLE: ColorStyle = { text: 'text-ink-soft', bg: 'bg-panel', border: 'border-line', dot: 'bg-ink-faint' }
