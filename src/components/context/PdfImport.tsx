import { useRef, useState } from 'react'
import type { IndicatorId, IndicatorInputs } from '@/engine'
import { indicatorList } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button } from '@/components/ui'
import { parseMitolabItems, type ParsedReport } from '@/import/parseMitolab'
import { readPdfTextItems } from '@/import/readPdf'

type State =
  | { kind: 'idle' }
  | { kind: 'reading'; name: string }
  | { kind: 'error'; message: string }
  | { kind: 'preview'; name: string; report: ParsedReport }

const fmt = (id: IndicatorId, v: number) =>
  ['complexI', 'complexII', 'complexIII', 'complexIV', 'complexV', 'mitoMembrane', 'stressReaction', 'nonMitoRespiration'].includes(id)
    ? v > 0
      ? `+${v}`
      : v < 0
        ? `−${Math.abs(v)}`
        : '0'
    : `${v}`

/** Загрузка бланка MITOLAB в PDF: распознавание в браузере, внесение после подтверждения. */
export function PdfImport() {
  const { applyImport, inputs } = useMitoPassport()
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      setState({ kind: 'error', message: 'Нужен файл в формате PDF.' })
      return
    }
    setState({ kind: 'reading', name: file.name })
    try {
      const items = await readPdfTextItems(file)
      if (items.length === 0) {
        setState({ kind: 'error', message: 'В файле нет текста: похоже на скан или фотографию. Введите значения вручную.' })
        return
      }
      const report = parseMitolabItems(items)
      if (Object.keys(report.values).length === 0) {
        setState({ kind: 'error', message: 'Показатели не найдены. Проверьте, что это бланк MITOLAB, или введите значения вручную.' })
        return
      }
      setState({ kind: 'preview', name: file.name, report })
    } catch {
      setState({ kind: 'error', message: 'Не удалось прочитать файл. Проверьте подключение к интернету (модуль чтения PDF загружается при первом использовании) или введите значения вручную.' })
    }
  }

  function apply(report: ParsedReport) {
    applyImport(report.values as IndicatorInputs, report.date)
    setState({ kind: 'idle' })
  }

  const hasInput = Object.keys(inputs).length > 0

  return (
    <div
      className={`border border-dashed px-4 py-3 transition-colors ${dragOver ? 'border-brand bg-brand-tint' : 'border-line bg-paper'}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        void handleFile(e.dataTransfer.files[0])
      }}
    >
      <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)} />

      {state.kind !== 'preview' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {state.kind === 'reading' ? `Читаю ${state.name}…` : 'Перетащите сюда PDF-бланк MITOLAB или выберите файл. Файл обрабатывается на этом компьютере и никуда не отправляется.'}
          </p>
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={state.kind === 'reading'}>
            Загрузить PDF
          </Button>
        </div>
      )}

      {state.kind === 'error' && <p className="mt-2 text-sm text-[#7a1f24]">{state.message}</p>}

      {state.kind === 'preview' && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink">Распознано из «{state.name}»</p>
            {state.report.date && <p className="text-sm text-ink-soft">дата {state.report.date}</p>}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
            {indicatorList
              .filter((d) => state.report.values[d.id] !== undefined)
              .map((d) => (
                <div key={d.id} className="flex justify-between gap-3 border-b border-line-soft py-1">
                  <dt className="truncate text-ink-soft" title={d.label}>
                    {d.shortLabel}
                  </dt>
                  <dd className="font-medium text-ink">
                    {fmt(d.id, state.report.values[d.id]!)}
                    {d.id === 'nadh' && state.report.nadhInUnits ? ' Ед' : ''}
                  </dd>
                </div>
              ))}
          </dl>
          <div className="mt-3 grid gap-1 text-xs text-ink-soft">
            <p>Найдено показателей: {Object.keys(state.report.values).length}. Сверьте числа с бланком; после внесения их можно исправить.</p>
            {state.report.nadhInUnits && <p>НАДН указан в условных единицах (MITO Standart): при сравнении с Pro и Max — с оговоркой.</p>}
            {state.report.unassigned.length > 0 && <p className="text-[#8a4310]">Не удалось отнести к показателю: {state.report.unassigned.join(', ')}.</p>}
            {hasInput && <p className="text-[#8a4310]">Текущие значения формы будут заменены.</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => apply(state.report)}>Внести в форму</Button>
            <Button variant="ghost" onClick={() => setState({ kind: 'idle' })}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
