import { Navigate, useNavigate } from 'react-router-dom'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { SummaryHeader } from '@/components/result/SummaryHeader'
import { IndicatorTable } from '@/components/result/IndicatorTable'
import { DomainCards } from '@/components/result/DomainCards'
import { PatternCards } from '@/components/result/PatternCards'
import { NarrativeBlock } from '@/components/result/NarrativeBlock'
import { SafetyBlock } from '@/components/result/SafetyBlock'

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

      <SummaryHeader result={result} />
      <IndicatorTable result={result} />
      <DomainCards result={result} />
      <PatternCards result={result} />
      <NarrativeBlock result={result} />
      <SafetyBlock result={result} />
    </div>
  )
}
