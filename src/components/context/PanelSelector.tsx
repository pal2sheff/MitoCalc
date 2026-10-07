import type { PanelId } from '@/engine'
import { panels } from '@/config'
import { useMitoPassport } from '@/state/MitoPassportContext'

const OPTIONS: { id: PanelId | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Определить по введённым' },
  ...panels.map((p) => ({ id: p.id, label: p.label })),
]

export function PanelSelector() {
  const { priorityContext, updateContext } = useMitoPassport()
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-ink-soft uppercase">Комплектация</h2>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => updateContext({ panel: o.id })}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              priorityContext.panel === o.id ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:bg-panel'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Смотрите на фактический состав проб в бланке, а не на название комплектации. При выбранной комплектации поля вне её скрыты и
        в расчёт не берутся.
      </p>
    </section>
  )
}
