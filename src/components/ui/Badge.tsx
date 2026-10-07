import type { ReactNode } from 'react'
import type { ContourSeverity, OverallRiskLevel, PatternConfidence, RiskScore, SafetyFlagLevel } from '@/engine'
import { contourSeverityToColor, overallRiskLevelToColor, riskScoreToColor } from '@/engine'
import { CONFIDENCE_STYLES, SAFETY_LEVEL_STYLES, ZONE_COLOR_STYLES, type ColorStyle } from './colorStyles'

export function Badge({ style, children, className = '' }: { style: ColorStyle; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs whitespace-nowrap ${style.bg} ${style.text} ${className}`}>
      {children}
    </span>
  )
}

export function RiskBadge({ riskScore, children }: { riskScore: RiskScore; children: ReactNode }) {
  return <Badge style={ZONE_COLOR_STYLES[riskScoreToColor(riskScore)]}>{children}</Badge>
}

export function ContourStateBadge({ severity, children }: { severity: ContourSeverity; children: ReactNode }) {
  return <Badge style={ZONE_COLOR_STYLES[contourSeverityToColor(severity)]}>{children}</Badge>
}

export function ConfidenceBadge({ confidence }: { confidence: PatternConfidence }) {
  return <Badge style={CONFIDENCE_STYLES[confidence]}>уверенность {confidence}</Badge>
}

export function SafetyLevelBadge({ level, children }: { level: SafetyFlagLevel; children: ReactNode }) {
  return <Badge style={SAFETY_LEVEL_STYLES[level]}>{children}</Badge>
}

export function OverallRiskBadge({ level }: { level: OverallRiskLevel }) {
  return <Badge style={ZONE_COLOR_STYLES[overallRiskLevelToColor(level)]}>{level}</Badge>
}
