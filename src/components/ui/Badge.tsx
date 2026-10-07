import type { ReactNode } from 'react'
import type { ContourSeverity, OverallRiskLevel, PatternConfidence, RiskScore, SafetyFlagLevel } from '@/engine'
import { contourSeverityToColor, overallRiskLevelToColor, riskScoreToColor } from '@/engine'
import { CONFIDENCE_STYLES, SAFETY_LEVEL_STYLES, ZONE_COLOR_STYLES, type ColorStyle } from './colorStyles'

export function Badge({ style, children, className = '' }: { style: ColorStyle; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {children}
    </span>
  )
}

/** For a single indicator's zone, e.g. "Снижен". Color follows riskScore (0=green..3=red). */
export function RiskBadge({ riskScore, children }: { riskScore: RiskScore; children: ReactNode }) {
  return <Badge style={ZONE_COLOR_STYLES[riskScoreToColor(riskScore)]}>{children}</Badge>
}

/** Состояние функционального контура, цвет по тяжести. */
export function ContourStateBadge({ severity, children }: { severity: ContourSeverity; children: ReactNode }) {
  return <Badge style={ZONE_COLOR_STYLES[contourSeverityToColor(severity)]}>{children}</Badge>
}

/** For a pattern's confidence, e.g. "высокая". Deliberately not risk-colored — see colorStyles.ts. */
export function ConfidenceBadge({ confidence }: { confidence: PatternConfidence }) {
  return <Badge style={CONFIDENCE_STYLES[confidence]}>{confidence}</Badge>
}

/** For a safety flag's severity, e.g. "critical". */
export function SafetyLevelBadge({ level, children }: { level: SafetyFlagLevel; children: ReactNode }) {
  return <Badge style={SAFETY_LEVEL_STYLES[level]}>{children}</Badge>
}

/** For the integral risk level shown at the top of the result screen. */
export function OverallRiskBadge({ level }: { level: OverallRiskLevel }) {
  return <Badge style={ZONE_COLOR_STYLES[overallRiskLevelToColor(level)]}>{level}</Badge>
}
