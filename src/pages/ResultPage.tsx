import { Navigate, useNavigate } from 'react-router-dom'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { SummaryHeader } from '@/components/result/SummaryHeader'
import { IndicatorTable } from '@/components/result/IndicatorTable'
import { ContourCards } from '@/components/result/ContourCards'
import { PatternCards } from '@/components/result/PatternCards'
import { NarrativeBlock } from '@/components/result/NarrativeBlock'
import { SafetyBlock } from '@/components/result/SafetyBlock'
import { RedFlagsBlock } from '@/components/result/RedFlagsBlock'
import { StudyBlock } from '@/components/result/StudyBlock'
import { WorkupBlock } from '@/components/result/WorkupBlock'

export function ResultPage() {
  const { result } = useMitoPassport()
  const navigate = useNavigate()

  if (!result) return <Navigate to="/input" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Результат интерпретации</h1>
        <Button variant="secondary" onClick={() => navigate('/input')}>
          Изменить показатели
        </Button>
      </header>

      <RedFlagsBlock result={result} />
      <SummaryHeader result={result} />
      <StudyBlock result={result} />
      <IndicatorTable result={result} />
      <ContourCards result={result} />
      <PatternCards result={result} />
      <WorkupBlock result={result} />
      <NarrativeBlock result={result} />
      <SafetyBlock result={result} />
    </div>
  )
}
