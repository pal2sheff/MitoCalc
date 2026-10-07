import { useNavigate } from 'react-router-dom'
import { authorDecisions } from '@/config'
import { Button } from '@/components/ui'

export function DecisionsPage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Черновые решения калькулятора</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Решения, которых нет в пособии или где пособие противоречит само себе. Требуют согласования авторами. Числовые значения
            меняются в файле src/config/calibration.ts.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </header>
      <div className="border border-line bg-paper px-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="py-2 pr-3 font-medium">Раздел</th>
                <th className="py-2 pr-3 font-medium">Решение</th>
                <th className="py-2 font-medium">Где менять</th>
              </tr>
            </thead>
            <tbody>
              {authorDecisions.map((d) => (
                <tr key={d.decision} className="border-b border-line/60 align-top last:border-0">
                  <td className="py-2.5 pr-3 font-medium whitespace-nowrap text-ink">{d.area}</td>
                  <td className="py-2.5 pr-3 text-ink">{d.decision}</td>
                  <td className="py-2.5 text-xs text-ink-soft">{d.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
