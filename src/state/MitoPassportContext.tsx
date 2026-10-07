import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CalculationResult, IndicatorId, IndicatorInputs, PriorityContext } from '@/engine'
import { emptyPriorityContext, runCalculation } from '@/engine'
import { calculationConfig, exampleInputs } from '@/config'

interface MitoPassportContextValue {
  inputs: IndicatorInputs
  result: CalculationResult | null
  setValue: (id: IndicatorId, rawValue: string) => void
  loadExample: () => void
  clearForm: () => void
  calculate: () => void
  /** Клинические отметки врача для правил 7 и 8. */
  priorityContext: PriorityContext
  toggleConfirmedSystemic: (patternId: string) => void
  toggleExplainedByEvent: (patternId: string) => void
}

const MitoPassportContext = createContext<MitoPassportContextValue | null>(null)

export function MitoPassportProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<IndicatorInputs>({})
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [priorityContext, setPriorityContext] = useState<PriorityContext>(emptyPriorityContext)

  function applyContext(next: PriorityContext) {
    setPriorityContext(next)
    if (result) setResult(runCalculation(inputs, calculationConfig, next))
  }

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
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
    setPriorityContext(emptyPriorityContext)
  }

  function clearForm() {
    setInputs({})
    setResult(null)
    setPriorityContext(emptyPriorityContext)
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
