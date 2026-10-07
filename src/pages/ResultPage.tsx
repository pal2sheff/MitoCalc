import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { SummaryHeader } from '@/components/result/SummaryHeader'
import { IndicatorTable } from '@/components/result/IndicatorTable'
import { ContourCards } from '@/components/result/ContourCards'
import { PatternCards } from '@/components/result/PatternCards'
import { SafetyBlock } from '@/components/result/SafetyBlock'
import { RedFlagsBlock } from '@/components/result/RedFlagsBlock'
import { WorkupBlock } from '@/components/result/WorkupBlock'
import { DynamicsBlock } from '@/components/result/DynamicsBlock'
import { ConclusionBlock } from '@/components/result/ConclusionBlock'
import { computeDynamics } from '@/state/dynamics'

export function ResultPage() {
  const { result, prevInputs, dynamicsContext } = useMitoPassport()
  const navigate = useNavigate()
  const dynamics = useMemo(() => (result ? computeDynamics(result, prevInputs, dynamicsContext) : null), [result, prevInputs, dynamicsContext])

  if (!result) return <Navigate to="/input" replace />

  const nav = [
    ['summary', 'Сводка'],
    ['indicators', 'Показатели'],
    ['contours', 'Контуры'],
    ['patterns', 'Паттерны'],
    ...(dynamics ? [['dynamics', 'Динамика']] : []),
    ['workup', 'Обследование'],
    ['conclusion', 'Заключение'],
  ]

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-16 lg:grid-cols-[10rem_minmax(0,1fr)]">
      <aside className="no-print hidden lg:block">
        <nav className="sticky top-6 grid gap-1 text-sm" aria-label="Разделы результата">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }} className="border-l-2 border-transparent py-1 pl-3 text-ink-soft hover:border-brand hover:text-ink">
              {label}
            </a>
          ))}
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/input')}>
            Изменить ввод
          </Button>
        </nav>
      </aside>

      <main className="min-w-0">
        <RedFlagsBlock result={result} />
        <SummaryHeader result={result} />
        <div className="mt-12 grid gap-12">
          <IndicatorTable result={result} />
          <ContourCards result={result} />
          <PatternCards result={result} />
          {dynamics && <DynamicsBlock dynamics={dynamics} />}
          <WorkupBlock result={result} />
          <ConclusionBlock result={result} dynamics={dynamics} />
        </div>
        <div className="no-print mt-8 lg:hidden">
          <Button variant="secondary" onClick={() => navigate('/input')}>
            Изменить ввод
          </Button>
        </div>
        <SafetyBlock result={result} />
      </main>
    </div>
  )
}
