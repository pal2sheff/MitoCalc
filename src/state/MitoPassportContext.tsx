import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CalculationResult, IndicatorId, IndicatorInputs } from '@/engine'
import { runCalculation } from '@/engine'
import { calculationConfig, exampleInputs } from '@/config'

interface MitoPassportContextValue {
  inputs: IndicatorInputs
  result: CalculationResult | null
  setValue: (id: IndicatorId, rawValue: string) => void
  loadExample: () => void
  clearForm: () => void
  calculate: () => void
}

const MitoPassportContext = createContext<MitoPassportContextValue | null>(null)

export function MitoPassportProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<IndicatorInputs>({})
  const [result, setResult] = useState<CalculationResult | null>(null)

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
  }

  function clearForm() {
    setInputs({})
    setResult(null)
  }

  function calculate() {
    setResult(runCalculation(inputs, calculationConfig))
  }

  const value: MitoPassportContextValue = { inputs, result, setValue, loadExample, clearForm, calculate }
  return <MitoPassportContext.Provider value={value}>{children}</MitoPassportContext.Provider>
}

export function useMitoPassport(): MitoPassportContextValue {
  const ctx = useContext(MitoPassportContext)
  if (!ctx) throw new Error('useMitoPassport must be used within MitoPassportProvider')
  return ctx
}
