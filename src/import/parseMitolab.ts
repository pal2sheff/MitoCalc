import type { IndicatorId } from '@/engine/types'

/**
 * Разбор текста бланка MITOLAB (PDF с текстовым слоем).
 *
 * Бланк устроен так: у каждого показателя есть заголовок, под ним шкала с
 * подписями диапазонов («0-19,9 %») и «пузырёк» со значением («15 %»).
 * У функциональных проб — заголовок колонки («I комплекс», «Митохондриальная
 * мембрана») и под ним значение со знаком («-25.5%»).
 *
 * Значение относится к ближайшему заголовку над ним:
 *  - для базовых показателей положение по горизонтали не важно (пузырёк
 *    стоит там, где значение на шкале);
 *  - для проб заголовок должен быть в той же колонке.
 * Подписи диапазонов («0-19,9 %») и шкалы приборов («−20», «0», «+20»)
 * значениями не считаются.
 */

export interface PdfTextItem {
  str: string
  x: number
  y: number
  width: number
  page: number
}

export interface ParsedReport {
  values: Partial<Record<IndicatorId, number>>
  /** Дата забора или дата на обложке, ДД.ММ.ГГГГ. */
  date?: string
  /** НАДН в условных единицах (MITO Standart). */
  nadhInUnits: boolean
  /** Найденные в бланке значения, которые не удалось отнести к показателю. */
  unassigned: string[]
}

interface Anchor {
  id: IndicatorId
  kind: 'base' | 'probe'
  page: number
  y: number
  cx: number
}

const BASE_TITLES: [RegExp, IndicatorId][] = [
  [/фагоцитоз/i, 'phagocytosis'],
  [/нст-тест|кислородный и энергетический обмен/i, 'nst'],
  [/оксидативный стресс/i, 'oxidativeStress'],
  [/кальциевый стресс/i, 'calciumStress'],
  [/белковый обмен/i, 'proteinMetabolism'],
  [/митохондриальная активность/i, 'mitoActivity'],
  [/накопления надн|уровень.*надн/i, 'nadh'],
]

const ROMAN: Record<string, IndicatorId> = {
  I: 'complexI',
  II: 'complexII',
  III: 'complexIII',
  IV: 'complexIV',
  V: 'complexV',
}

/** Заголовки колонок проб. Слово «Митохондриальная» общее, поэтому якорь — вторая строка. */
const PROBE_TITLES: [RegExp, IndicatorId][] = [
  [/^мембрана$/i, 'mitoMembrane'],
  [/^клеточный стресс$/i, 'stressReaction'],
  [/^дыхание$/i, 'nonMitoRespiration'],
]

const VALUE_RE = /^([+\-−]?\d+(?:[.,]\d+)?)\s?(%|Ед)$/
const DATE_RE = /\b(\d{2}\.\d{2}\.\d{4})\b/

/** Вертикальное окно «значение под заголовком», пунктов PDF. */
const MAX_GAP = 75
/** Допуск по горизонтали для колонок проб, пунктов PDF. */
const MAX_DX = 70

export function parseMitolabItems(items: PdfTextItem[]): ParsedReport {
  const anchors: Anchor[] = []
  for (const it of items) {
    const s = it.str.trim()
    const cx = it.x + it.width / 2
    // Пропускаем длинные строки-комментарии («Работа I комплекса … (комплекс I):»).
    if (s.length > 60 || s.endsWith(':')) continue

    const base = BASE_TITLES.find(([re]) => re.test(s))
    if (base && !/^ваш результат/i.test(s)) {
      anchors.push({ id: base[1], kind: 'base', page: it.page, y: it.y, cx })
      continue
    }
    const roman = s.match(/^(I|II|III|IV|V)(\s+комплекс)?$/)
    if (roman) {
      anchors.push({ id: ROMAN[roman[1]], kind: 'probe', page: it.page, y: it.y, cx })
      continue
    }
    const probe = PROBE_TITLES.find(([re]) => re.test(s))
    if (probe) anchors.push({ id: probe[1], kind: 'probe', page: it.page, y: it.y, cx })
  }

  const values: ParsedReport['values'] = {}
  const unassigned: string[] = []
  let nadhInUnits = false

  for (const it of items) {
    const s = it.str.trim()
    const m = s.match(VALUE_RE)
    if (!m) continue
    const value = Number.parseFloat(m[1].replace('−', '-').replace(',', '.'))
    const cx = it.x + it.width / 2

    const candidates = anchors
      .filter((a) => a.page === it.page && a.y > it.y && a.y - it.y <= MAX_GAP)
      .filter((a) => a.kind === 'base' || Math.abs(a.cx - cx) <= MAX_DX)
      .sort((a, b) => a.y - it.y - (b.y - it.y))

    const target = candidates[0]
    if (!target || values[target.id] !== undefined) {
      unassigned.push(s)
      continue
    }
    values[target.id] = value
    if (target.id === 'nadh' && m[2] === 'Ед') nadhInUnits = true
  }

  // Дата: сначала «Дата забора крови» (значение справа на той же строке), иначе дата на обложке.
  let date: string | undefined
  const label = items.find((i) => /дата забора/i.test(i.str))
  if (label) {
    const sameLine = items.filter((i) => i.page === label.page && Math.abs(i.y - label.y) < 3 && i.x > label.x)
    date = sameLine.map((i) => i.str.match(DATE_RE)?.[1]).find(Boolean)
  }
  if (!date) date = items.map((i) => i.str.match(DATE_RE)?.[1]).find(Boolean)

  return { values, date, nadhInUnits, unassigned }
}
