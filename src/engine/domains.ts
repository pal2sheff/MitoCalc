import type { DomainCategory, DomainDefinition, DomainResult, IndicatorResult, RiskScore } from './types'

const CATEGORY_ORDER: DomainCategory[] = ['норма', 'умеренное напряжение', 'выраженное нарушение', 'критический паттерн']

function categoryFromAvg(avg: number): DomainCategory {
  if (avg <= 0.75) return 'норма'
  if (avg <= 1.5) return 'умеренное напряжение'
  if (avg <= 2.25) return 'выраженное нарушение'
  return 'критический паттерн'
}

function maxCategory(a: DomainCategory, b: DomainCategory): DomainCategory {
  return CATEGORY_ORDER.indexOf(a) >= CATEGORY_ORDER.indexOf(b) ? a : b
}

/**
 * Level 2: aggregate indicator results into clinical domains.
 * A single risk-3 (red) member floors the domain category at least at
 * "выраженное нарушение" even if the domain average looks mild — one severe
 * finding should not be diluted away by otherwise-normal peers.
 */
export function calculateDomains(indicatorResults: IndicatorResult[], domainDefs: DomainDefinition[]): DomainResult[] {
  const byId = new Map(indicatorResults.map((r) => [r.id, r]))

  const results = domainDefs.map((domain) => {
    const members = domain.indicatorIds.map((id) => byId.get(id)).filter((r): r is IndicatorResult => !!r)

    if (members.length === 0) {
      return {
        id: domain.id,
        label: domain.label,
        description: domain.description,
        indicatorIds: domain.indicatorIds,
        avgRisk: 0,
        maxRisk: 0 as RiskScore,
        category: 'норма' as DomainCategory,
        interpretation: 'Недостаточно введённых показателей для оценки домена.',
        nextStep: domain.nextStep,
      }
    }

    const avgRisk = members.reduce((sum, m) => sum + m.riskScore, 0) / members.length
    const maxRisk = Math.max(...members.map((m) => m.riskScore)) as RiskScore

    let category = categoryFromAvg(avgRisk)
    if (maxRisk === 3) category = maxCategory(category, 'выраженное нарушение')

    return {
      id: domain.id,
      label: domain.label,
      description: domain.description,
      indicatorIds: domain.indicatorIds,
      avgRisk,
      maxRisk,
      category,
      interpretation: domain.interpretationByCategory[category],
      nextStep: domain.nextStep,
    }
  })

  return results.sort((a, b) => b.avgRisk - a.avgRisk)
}
