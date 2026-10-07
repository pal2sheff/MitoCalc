import type { PatternMatch, PatternPriority, PriorityContext } from './types'

/**
 * Выбор ведущего паттерна по правилам раздела 6.3 пособия.
 *
 * Уровни: A системный контекст, B функциональный контур, C уровень
 * ограничения, D компенсация, E сохранный профиль.
 *
 * Правило 1. Активный и подтверждённый паттерн уровня A становится ведущим.
 * Правило 2. Паттерны уровня C ведущими самостоятельно не бывают.
 * Правило 3. Паттерн 12 (уровень D) ведущим не бывает.
 * Правило 4. При активном повреждающем факторе (2, 3, 10, 14) паттерны
 *            дефицита (4, 5, 6) обрабатываются вторыми.
 * Правило 5. При активном профиле 15 остальные активные паттерны
 *            пересматриваются в контексте всей картины.
 * Правило 6. Реализовано в detectPatterns (статус «не оценён»).
 * Правило 7. Паттерн, объяснимый недавним событием, ведущим не назначается.
 * Правило 8. Уровень A ведущий только при подтверждении клиникой.
 */

/** Номера паттернов-повреждающих факторов (правило 4). */
const DAMAGING = new Set([2, 3, 10, 14])
/** Номера паттернов дефицита (правило 4). */
const DEFICIT = new Set([4, 5, 6])

const names = (ms: PatternMatch[]) => ms.map((m) => `${m.pattern.manualNumber}`).join(', ')

export const emptyPriorityContext: PriorityContext = { confirmedSystemic: [], explainedByEvent: [] }

export function selectLeadingPattern(matches: PatternMatch[], context: PriorityContext = emptyPriorityContext): PatternPriority {
  const appliedRules: string[] = []

  const explainedByEvent = matches.filter((m) => context.explainedByEvent.includes(m.pattern.id))
  const pool = matches.filter((m) => !context.explainedByEvent.includes(m.pattern.id))
  if (explainedByEvent.length > 0) {
    appliedRules.push(
      `Правило 7: паттерны ${names(explainedByEvent)} отмечены как объяснимые условиями забора или недавним событием и в выборе ведущего не участвуют.`,
    )
  }

  const levelA = pool.filter((m) => m.pattern.level === 'A')
  const confirmedA = levelA.filter((m) => context.confirmedSystemic.includes(m.pattern.id))
  const unconfirmedSystemic = levelA.filter((m) => !context.confirmedSystemic.includes(m.pattern.id))

  if (pool.some((m) => m.pattern.level === 'C')) {
    appliedRules.push('Правило 2: паттерны уровня ограничения (C) уточняют место нарушения и ведущими не назначаются.')
  }
  if (pool.some((m) => m.pattern.level === 'D')) {
    appliedRules.push('Правило 3: немитохондриальная компенсация ведущей не бывает — сначала ищется то, что компенсируется.')
  }

  const damagingActive = pool.some((m) => DAMAGING.has(m.pattern.manualNumber))
  if (damagingActive && pool.some((m) => DEFICIT.has(m.pattern.manualNumber))) {
    appliedRules.push(
      'Правило 4: активен повреждающий фактор, поэтому паттерны дефицита обрабатываются вторыми. Энергостимуляция при активном повреждении может ухудшить состояние.',
    )
  }

  let leading: PatternMatch | null = null
  let leadingReason = ''

  if (confirmedA.length > 0) {
    leading = confirmedA[0]
    leadingReason = 'Правила 1 и 8: активен паттерн системного контекста, подтверждённый клиникой. Остальные паттерны описываются как его проявления.'
  } else {
    if (unconfirmedSystemic.length > 0) {
      appliedRules.push(
        `Правило 8: паттерны системного контекста ${names(unconfirmedSystemic)} активированы, но клиникой не подтверждены. Ведущим становится верхний подтверждённый уровень, отсутствие системного объяснения указывается в заключении прямо.`,
      )
    }

    const levelB = pool.filter((m) => m.pattern.level === 'B')
    if (levelB.length > 0) {
      const rank = (m: PatternMatch) =>
        DAMAGING.has(m.pattern.manualNumber) ? 0 : damagingActive && DEFICIT.has(m.pattern.manualNumber) ? 2 : 1
      leading = [...levelB].sort((a, b) => rank(a) - rank(b) || a.pattern.order - b.pattern.order)[0]
      leadingReason = DAMAGING.has(leading.pattern.manualNumber)
        ? 'Ведущий выбран на уровне функционального контура (B): повреждающий механизм стоит выше паттернов дефицита.'
        : 'Ведущий выбран на уровне функционального контура (B) — верхнем подтверждённом уровне.'
    } else {
      const levelE = pool.find((m) => m.pattern.level === 'E')
      if (levelE) {
        leading = levelE
        leadingReason = 'Активен сохранный профиль (E), паттернов системного и контурного уровня нет.'
      } else if (pool.length > 0) {
        leadingReason =
          'Активны только паттерны уровня ограничения или компенсации. По правилам 2 и 3 ведущими они не назначаются: ведущий механизм не определён, требуется поиск компенсируемого нарушения и системного контекста.'
      } else {
        leadingReason = 'Активированных паттернов нет.'
      }
    }
  }

  if (pool.some((m) => m.pattern.level === 'E') && pool.some((m) => m.pattern.level !== 'E')) {
    appliedRules.push(
      'Правило 5: сохранный профиль соответствует общей картине, остальные активированные паттерны требуют повторной оценки в контексте всей совокупности показателей.',
    )
  }

  const manifestations = pool.filter((m) => m !== leading)

  return { leading, leadingReason, manifestations, unconfirmedSystemic, explainedByEvent, appliedRules }
}
