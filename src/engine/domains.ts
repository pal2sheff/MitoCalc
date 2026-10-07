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
    const missingIndicatorIds = domain.indicatorIds.filter((id) => !byId.has(id))

    if (members.length === 0) {
      return {
        id: domain.id,
        label: domain.label,
        description: domain.description,
        indicatorIds: domain.indicatorIds,
        avgRisk: 0,
        maxRisk: 0 as RiskScore,
        category: 'норма' as DomainCategory,
        interpretation:
          'Домен не оценён: входящие в него показатели в исследование не включены. Неизмеренное не означает сохранного.',
        nextStep: domain.nextStep,
        evaluated: false,
        missingIndicatorIds,
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
      interpretation:
        missingIndicatorIds.length > 0
          ? `${domain.interpretationByCategory[category]} Оценка неполная: часть показателей домена в исследование не включена.`
          : domain.interpretationByCategory[category],
      nextStep: domain.nextStep,
      evaluated: true,
      missingIndicatorIds,
    }
  })

  // Неоценённые домены — в конец списка, оценённые — по убыванию напряжения.
  return results.sort((a, b) => Number(b.evaluated) - Number(a.evaluated) || b.avgRisk - a.avgRisk)
}
