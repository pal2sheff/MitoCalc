import { useEffect, useMemo, useState } from 'react'
import type { CalculationResult, DynamicsResult } from '@/engine'
import { autoChecklist, buildConclusion, checkForbiddenPhrases, conclusionToText } from '@/engine'
import { conclusionChecklist, controlGoals, forbiddenPhrases } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Button, Card } from '@/components/ui'

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Документ для Word: Times New Roman 14, одинарный интервал, абзацный отступ. */
function toWordHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p, i) =>
      i === 0
        ? `<p style="text-align:center;font-weight:bold;text-indent:0">${escapeHtml(p)}</p>`
        : `<p>${escapeHtml(p).replace(/\n/g, ' ')}</p>`,
    )
    .join('')
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:"Times New Roman";font-size:14pt}p{margin:0;line-height:1;text-indent:1.25cm;text-align:justify;font-family:"Times New Roman";font-size:14pt}</style></head><body>${paragraphs}</body></html>`
}

export function ConclusionBlock({ result, dynamics }: { result: CalculationResult; dynamics: DynamicsResult | null }) {
  const { priorityContext } = useMitoPassport()
  const generated = useMemo(
    () => conclusionToText(buildConclusion(result, priorityContext, controlGoals, dynamics)),
    [result, priorityContext, dynamics],
  )
  const [text, setText] = useState(generated)
  const [edited, setEdited] = useState(false)
  const [manual, setManual] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!edited) setText(generated)
  }, [generated, edited])

  const hits = checkForbiddenPhrases(text, forbiddenPhrases)
  const auto = autoChecklist(result, priorityContext, hits)
  const allChecked = conclusionChecklist.every((i) => (auto[i.id] ?? manual[i.id]) === true)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Заключение (шаблон 9.2)</h2>
        {edited && (
          <Button
            variant="ghost"
            onClick={() => {
              setEdited(false)
              setText(generated)
            }}
          >
            Вернуть сгенерированный текст
          </Button>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setEdited(true)
        }}
        rows={18}
        className="w-full rounded-lg border border-line bg-canvas px-3 py-2 font-serif text-sm leading-relaxed text-ink"
      />

      {hits.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-red-800 uppercase">Формулировки, которые не пишутся в заключении (9.4)</p>
          <ul className="mt-1 space-y-1 text-sm text-red-900">
            {hits.map((h, i) => (
              <li key={`${h.id}-${i}`}>
                «{h.match}» — {h.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Чек-лист перед выдачей (9.5)</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink">
          {conclusionChecklist.map((item) => {
            const a = auto[item.id]
            return (
              <li key={item.id} className="flex items-start gap-2">
                <input
                  className="mt-1"
                  type="checkbox"
                  disabled={a !== null}
                  checked={a ?? manual[item.id] ?? false}
                  onChange={() => setManual((m) => ({ ...m, [item.id]: !m[item.id] }))}
                />
                <span className={a === false ? 'text-red-800' : ''}>
                  {item.label}
                  {a !== null && <span className="text-xs text-ink-soft"> (проверено автоматически)</span>}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={copy}>{copied ? 'Скопировано' : 'Копировать'}</Button>
        <Button variant="secondary" onClick={() => download('zaklyuchenie.doc', toWordHtml(text), 'application/msword')}>
          Скачать для Word
        </Button>
        <Button variant="secondary" onClick={() => download('zaklyuchenie.txt', text, 'text/plain;charset=utf-8')}>
          Скачать .txt
        </Button>
      </div>
      {!allChecked && (
        <p className="mt-2 text-xs text-ink-soft">Не все пункты чек-листа отмечены. Выгрузка доступна, но проверьте пункты перед выдачей.</p>
      )}
    </Card>
  )
}
