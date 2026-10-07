import { useEffect, useMemo, useState } from 'react'
import type { CalculationResult, DynamicsResult } from '@/engine'
import { autoChecklist, buildConclusion, checkForbiddenPhrases, conclusionToText } from '@/engine'
import { conclusionChecklist, controlGoals, forbiddenPhrases } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'
import { Accordion, Button, Section } from '@/components/ui'

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

  const done = conclusionChecklist.filter((i) => (auto[i.id] ?? manual[i.id]) === true).length

  return (
    <Section
      id="conclusion"
      title="Заключение"
      aside={
        edited ? (
          <button
            type="button"
            className="text-brand hover:text-brand-dark"
            onClick={() => {
              setEdited(false)
              setText(generated)
            }}
          >
            Вернуть исходный текст
          </button>
        ) : (
          'текст можно править'
        )
      }
    >
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setEdited(true)
        }}
        rows={20}
        aria-label="Текст заключения"
        className="block w-full border border-line bg-paper px-6 py-5 font-serif text-[15px] leading-relaxed text-ink focus:border-brand focus:outline-none"
      />

      {hits.length > 0 && (
        <div className="mt-3 border-l-4 border-zone-severe bg-[#f8e3e3] px-4 py-3 text-sm text-[#5e1519]">
          <p className="font-medium">Эти формулировки не пишутся в заключении</p>
          <ul className="mt-1 grid gap-1">
            {hits.map((h, i) => (
              <li key={`${h.id}-${i}`}>
                «{h.match}»: {h.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy}>{copied ? 'Скопировано' : 'Копировать'}</Button>
          <Button variant="secondary" onClick={() => download('zaklyuchenie.doc', toWordHtml(text), 'application/msword')}>
            Скачать для Word
          </Button>
          <Button variant="ghost" onClick={() => download('zaklyuchenie.txt', text, 'text/plain;charset=utf-8')}>
            .txt
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            Печать
          </Button>
        </div>
        <span className={`text-sm ${allChecked ? 'text-[#1d5c44]' : 'text-ink-soft'}`}>
          Чек-лист: {done} из {conclusionChecklist.length}
        </span>
      </div>

      <Accordion className="no-print mt-3" summary="Чек-лист перед выдачей">
        <ul className="grid gap-1.5 text-ink">
          {conclusionChecklist.map((item) => {
            const a = auto[item.id]
            return (
              <li key={item.id}>
                <label className="flex items-start gap-2.5">
                  <input
                    className="mt-0.5 h-4 w-4 shrink-0"
                    type="checkbox"
                    disabled={a !== null}
                    checked={a ?? manual[item.id] ?? false}
                    onChange={() => setManual((m) => ({ ...m, [item.id]: !m[item.id] }))}
                  />
                  <span className={a === false ? 'text-[#7a1f24]' : ''}>
                    {item.label}
                    {a !== null && <span className="text-xs text-ink-faint"> · проверено автоматически</span>}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </Accordion>
    </Section>
  )
}
