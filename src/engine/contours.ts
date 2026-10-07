import type {
  ContourDefinition,
  ContourResult,
  IndicatorId,
  IndicatorResult,
  LeadingContour,
} from './types'
import { evaluateConditionTri, type IndicatorResultMap } from './conditions'

/**
 * Сборка функциональных контуров (глава 5 пособия).
 *
 * Контур собирается только из измеренных показателей (раздел 5.6):
 *  - нет показателя из requiredIndicators → «не оценён»;
 *  - есть все обязательные, но не все входящие → «оценён частично».
 * Состояние — первое выполненное правило из states. Если ни одно не
 * выполнено, состояние выводится по числу отклонённых показателей: одиночное
 * отклонение остаётся наблюдением, а не механизмом (раздел 5.0).
 */
export function calculateContours(indicatorResults: IndicatorResult[], defs: ContourDefinition[]): ContourResult[] {
  const map: IndicatorResultMap = {}
  for (const r of indicatorResults) map[r.id] = r

  return [...defs]
    .sort((a, b) => a.order - b.order)
    .map((def) => {
      const members: IndicatorId[] = [...def.keyIndicators, ...def.additionalIndicators]
      const missingIndicatorIds = members.filter((id) => !map[id])
      const deviatedIndicators = members
        .map((id) => map[id])
        .filter((r): r is IndicatorResult => !!r && r.riskScore > 0)
        .map((r) => ({ id: r.id, label: r.definition.shortLabel, zoneLabel: r.zone.label }))

      const base = {
        id: def.id,
        label: def.label,
        question: def.question,
        missingIndicatorIds,
        deviatedIndicators,
        searchDirection: def.searchDirection,
      }

      if (def.requiredIndicators.some((id) => !map[id])) {
        return { ...base, status: 'не оценён' as const, state: null, notes: [] }
      }

      const rule = def.states.find((s) => evaluateConditionTri(s.when, map) === true)
      const keyDeviated = deviatedIndicators.filter((d) => def.keyIndicators.includes(d.id)).length

      const state = rule
        ? { id: rule.id, label: rule.label, severity: rule.severity, text: rule.text }
        : deviatedIndicators.length === 0
          ? { id: 'noDeviation', label: 'Без отклонений', severity: 0 as const, text: 'Измеренные показатели контура в целевых зонах.' }
          : deviatedIndicators.length === 1 || keyDeviated === 0
            ? {
                id: 'observation',
                label: 'Наблюдение',
                severity: 1 as const,
                text: 'Одиночное или несогласованное отклонение. Механизм по контуру не формулируется.',
              }
            : {
                id: 'unclassified',
                label: 'Изменён',
                severity: 2 as const,
                text: 'Несколько показателей контура отклонены, но сочетание не совпадает ни с одним типовым состоянием. Требуется разбор по показателям.',
              }

      const notes = (def.notes ?? []).filter((n) => evaluateConditionTri(n.when, map) === true).map((n) => n.text)

      return {
        ...base,
        status: missingIndicatorIds.length > 0 ? ('оценён частично' as const) : ('оценён' as const),
        state,
        notes,
      }
    })
}

function find(results: ContourResult[], id: string): ContourResult | undefined {
  return results.find((r) => r.id === id)
}

const sev = (c: ContourResult | undefined): number => c?.state?.severity ?? 0
const changed = (c: ContourResult | undefined): boolean => sev(c) >= 2

/**
 * Ведущий контур по ориентирам раздела 5.4. Ведущим считается контур,
 * стоящий выше в причинно-следственной цепи:
 * редокс → мембранный узел → энергетика → анаболизм; иммунный — отдельно.
 */
export function selectLeadingContour(results: ContourResult[]): LeadingContour | null {
  const redox = find(results, 'redox')
  const energy = find(results, 'energy')
  const membrane = find(results, 'membrane')
  const immune = find(results, 'immune')
  const anabolic = find(results, 'anabolic')
  const adaptive = find(results, 'adaptive')

  if (adaptive?.state?.id === 'hiddenDecrease') {
    return {
      contour: adaptive,
      reason: 'Базовые показатели в целевых зонах, а ответ на нагрузку отсутствует: ведущим считается адаптационно-резервный контур независимо от остальных находок.',
    }
  }
  if (changed(redox)) {
    return {
      contour: redox!,
      reason: 'Выражена окислительная нагрузка: редокс-контур стоит выше остальных в причинно-следственной цепи.',
    }
  }
  if (changed(energy)) {
    return {
      contour: energy!,
      reason: 'Энергетика изменена при спокойном редокс-фоне: причину ищут в обеспечении.',
    }
  }
  if (changed(membrane)) {
    return { contour: membrane!, reason: 'Изменён мембранно-сопрягающий узел при спокойных редокс- и энергетическом контурах.' }
  }
  if (changed(anabolic)) {
    return { contour: anabolic!, reason: 'Изменён анаболически-восстановительный контур при сохранной энергетике и спокойном редокс-фоне.' }
  }
  if (changed(immune)) {
    return {
      contour: immune!,
      reason: 'Изменён только иммунный контур при сохранных остальных: ищут инфекционный или воспалительный источник.',
    }
  }
  if (changed(adaptive)) {
    return { contour: adaptive!, reason: 'Изменён только адаптационно-резервный контур.' }
  }
  return null
}
