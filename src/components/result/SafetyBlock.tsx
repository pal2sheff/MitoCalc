import type { CalculationResult } from '@/engine'
import { Accordion } from '@/components/ui'

/** Ограничения метода: общий текст, свёрнут внизу экрана. */
export function SafetyBlock({ result }: { result: CalculationResult }) {
  const n = result.generalSafetyNotes
  return (
    <footer className="mt-12 border-t border-line pt-4 text-sm text-ink-soft">
      <p>{n.generalDisclaimer}</p>
      <Accordion className="no-print mt-3" summary="Ограничения метода и когда направлять на стандартное обследование">
        <div className="grid gap-4">
          {[
            ['Требуют приоритетной очной оценки', n.redFlags],
            ['Не интерпретировать изолированно', n.whenNotToInterpretAlone],
            ['Когда направить на стандартное обследование', n.whenToReferToStandardWorkup],
          ].map(([title, items]) => (
            <div key={title as string}>
              <p className="font-medium text-ink">{title as string}</p>
              <ul className="mt-1 grid gap-1">
                {(items as string[]).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Accordion>
    </footer>
  )
}
