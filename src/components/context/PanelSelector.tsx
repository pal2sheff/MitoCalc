import type { PanelId } from '@/engine'
import { panels } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'

const OPTIONS: { id: PanelId | 'auto'; label: string }[] = [
  { id: 'auto', label: 'По введённым' },
  ...panels.map((p) => ({ id: p.id, label: p.label.replace(' (ФАН)', '') })),
]

export function PanelSelector() {
  const { priorityContext, updateContext } = useMitoPassport()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-ink-soft">Комплектация</span>
      <div className="inline-flex flex-wrap rounded border border-line bg-paper p-0.5" role="radiogroup" aria-label="Комплектация">
        {OPTIONS.map((o) => {
          const active = priorityContext.panel === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => updateContext({ panel: o.id })}
              className={`rounded-sm px-3 py-1 text-sm ${active ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink'}`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
