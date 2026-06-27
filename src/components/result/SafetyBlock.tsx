import type { CalculationResult } from '@/engine'
import { Accordion, Card, SafetyLevelBadge } from '@/components/ui'

export function SafetyBlock({ result }: { result: CalculationResult }) {
  const { safetyFlags, generalSafetyNotes } = result

  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-soft uppercase">Безопасность интерпретации</h2>

      {safetyFlags.length > 0 && (
        <ul className="mb-4 space-y-2">
          {safetyFlags.map((flag) => (
            <li key={flag.id} className="flex flex-wrap items-start gap-2 text-sm leading-relaxed text-ink">
              <SafetyLevelBadge level={flag.level}>{flag.level}</SafetyLevelBadge>
              <span>{flag.text}</span>
            </li>
          ))}
        </ul>
      )}

      <Accordion summary="Red flags, когда не интерпретировать изолированно, когда направить на стандартное обследование">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Red flags</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {generalSafetyNotes.redFlags.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Не интерпретировать изолированно</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {generalSafetyNotes.whenNotToInterpretAlone.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Когда направить на стандартное обследование
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {generalSafetyNotes.whenToReferToStandardWorkup.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </Accordion>

      <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
        {generalSafetyNotes.generalDisclaimer}
      </p>
    </Card>
  )
}
