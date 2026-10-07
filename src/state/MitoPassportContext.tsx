import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CalculationResult, ClinicalContext, IndicatorId, IndicatorInputs } from '@/engine'
import { emptyClinicalContext, runCalculation } from '@/engine'
import { calculationConfig, exampleInputs } from '@/config'

interface MitoPassportContextValue {
  inputs: IndicatorInputs
  result: CalculationResult | null
  setValue: (id: IndicatorId, rawValue: string) => void
  loadExample: () => void
  clearForm: () => void
  calculate: () => void
  /** Клинический контекст: комплектация, условия забора, анамнез, ОАК, отметки правил 7 и 8. */
  priorityContext: ClinicalContext
  updateContext: (patch: Partial<ClinicalContext>) => void
  toggleInContext: (key: 'preanalytics' | 'clinicalFindings' | 'situations', id: string) => void
  toggleConfirmedSystemic: (patternId: string) => void
  toggleExplainedByEvent: (patternId: string) => void
}

const MitoPassportContext = createContext<MitoPassportContextValue | null>(null)

export function MitoPassportProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<IndicatorInputs>({})
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [priorityContext, setPriorityContext] = useState<ClinicalContext>(emptyClinicalContext)

  function applyContext(next: ClinicalContext) {
    setPriorityContext(next)
    if (result) setResult(runCalculation(inputs, calculationConfig, next))
  }

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  }

  function updateContext(patch: Partial<ClinicalContext>) {
    applyContext({ ...priorityContext, ...patch })
  }

  function toggleInContext(key: 'preanalytics' | 'clinicalFindings' | 'situations', id: string) {
    applyContext({ ...priorityContext, [key]: toggle(priorityContext[key], id) })
  }

  function toggleConfirmedSystemic(patternId: string) {
    applyContext({ ...priorityContext, confirmedSystemic: toggle(priorityContext.confirmedSystemic, patternId) })
  }

  function toggleExplainedByEvent(patternId: string) {
    applyContext({ ...priorityContext, explainedByEvent: toggle(priorityContext.explainedByEvent, patternId) })
  }

  function setValue(id: IndicatorId, rawValue: string) {
    setInputs((prev) => {
      if (rawValue.trim() === '') {
        const next = { ...prev }
        delete next[id]
        return next
      }
      const parsed = Number.parseFloat(rawValue)
      if (!Number.isFinite(parsed)) return prev
      return { ...prev, [id]: parsed }
    })
  }

  function loadExample() {
    setInputs(exampleInputs)
    setResult(null)
    setPriorityContext(emptyClinicalContext)
  }

  function clearForm() {
    setInputs({})
    setResult(null)
    setPriorityContext(emptyClinicalContext)
  }

  function calculate() {
    setResult(runCalculation(inputs, calculationConfig, priorityContext))
  }

  const value: MitoPassportContextValue = {
    inputs,
    result,
    setValue,
    loadExample,
    clearForm,
    calculate,
    priorityContext,
    updateContext,
    toggleInContext,
    toggleConfirmedSystemic,
    toggleExplainedByEvent,
  }
  return <MitoPassportContext.Provider value={value}>{children}</MitoPassportContext.Provider>
}

export function useMitoPassport(): MitoPassportContextValue {
  const ctx = useContext(MitoPassportContext)
  if (!ctx) throw new Error('useMitoPassport must be used within MitoPassportProvider')
  return ctx
}
