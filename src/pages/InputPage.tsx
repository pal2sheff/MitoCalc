import { useNavigate } from 'react-router-dom'
import { block1Indicators, block2Indicators, panels } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Accordion, Button, Section } from '@/components/ui'
import { IndicatorField } from '@/components/IndicatorField'
import { PanelSelector } from '@/components/context/PanelSelector'
import { ClinicalContextForm } from '@/components/context/ClinicalContextForm'
import { PreviousReportForm } from '@/components/context/PreviousReportForm'
import { PdfImport } from '@/components/context/PdfImport'

export function InputPage() {
  const navigate = useNavigate()
  const { inputs, setValue, loadExample, clearForm, calculate, priorityContext, prevInputs, importedIds } = useMitoPassport()

  const panel = panels.find((p) => p.id === priorityContext.panel)
  const visible = (id: string) => !panel || panel.indicatorIds.some((x) => x === id) || panel.optionalIndicatorIds.some((x) => x === id)
  const block1 = block1Indicators.filter((d) => visible(d.id))
  const block2 = block2Indicators.filter((d) => visible(d.id))
  const entered = Object.keys(inputs).length

  function handleCalculate() {
    calculate()
    navigate('/result')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Ввод результата</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Введите показатели из бланка. Неизмеренное не считается нормой: зависящие от него выводы будут отмечены как неоценённые.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={loadExample}>
            Пример
          </Button>
          <Button variant="ghost" onClick={clearForm}>
            Очистить
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <PdfImport />
      </div>

      <div className="mb-8">
        <PanelSelector />
      </div>

      <div className="grid gap-10">
        <Section title="Базовые показатели" aside="доля клеток, 0–100 %">
          <div className="bg-paper px-4 sm:px-5">
            {block1.map((d) => (
              <IndicatorField key={d.id} definition={d} value={inputs[d.id]} imported={importedIds.includes(d.id)} onChange={(raw) => setValue(d.id, raw)} />
            ))}
          </div>
        </Section>

        {block2.length > 0 && (
          <Section title="Функциональные пробы" aside="ΔНАДН, вводите число, а не стрелку бланка">
            <div className="bg-paper px-4 sm:px-5">
              {block2.map((d) => (
                <IndicatorField key={d.id} definition={d} value={inputs[d.id]} imported={importedIds.includes(d.id)} onChange={(raw) => setValue(d.id, raw)} />
              ))}
            </div>
            <Accordion className="mt-3" summary="Как читается знак пробы">
              Выше нуля — звено вносит вклад в поток; около нуля — вклад незначим; ниже нуля — НАДН расходуется в обход звена. У
              комплекса V минус означает снижение эффективности синтеза АТФ. Границы «около нуля» и «выражено» черновые, см. «Черновые
              решения».
            </Accordion>
          </Section>
        )}

        <Section title="Условия и клинический контекст">
          <div className="bg-paper px-4 py-4 sm:px-5">
            <ClinicalContextForm />
          </div>
        </Section>

        <Section title="Предыдущий отчёт" aside={Object.keys(prevInputs).length > 0 ? 'для оценки динамики' : 'необязательно'}>
          <details className="group bg-paper px-4 py-4 sm:px-5" open={Object.keys(prevInputs).length > 0}>
            <summary className="cursor-pointer text-sm text-brand select-none">
              <span className="group-open:hidden">Добавить значения прошлого исследования</span>
              <span className="hidden group-open:inline">Скрыть</span>
            </summary>
            <div className="mt-4">
              <PreviousReportForm />
            </div>
          </details>
        </Section>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm text-ink-soft">
            Введено показателей: {entered}
            {importedIds.length > 0 && <span className="hidden sm:inline"> · из PDF: {importedIds.length}, сверьте с бланком</span>}
          </span>
          <Button onClick={handleCalculate} disabled={entered === 0}>
            Рассчитать
          </Button>
        </div>
      </div>
    </div>
  )
}
