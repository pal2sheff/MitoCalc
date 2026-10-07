import { NavLink } from 'react-router-dom'
import { useMitoPassport } from '@/state/MitoPassportContext'

const link = ({ isActive }: { isActive: boolean }) =>
  `px-1 py-1 text-sm ${isActive ? 'text-ink border-b-2 border-brand' : 'text-ink-soft hover:text-ink border-b-2 border-transparent'}`

export function AppHeader() {
  const { result } = useMitoPassport()
  return (
    <header className="no-print border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-paper" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">МИТОпаспорт</span>
          <span className="hidden text-sm text-ink-soft sm:inline">калькулятор интерпретации</span>
        </NavLink>
        <nav className="flex gap-5">
          <NavLink to="/input" className={link}>
            Ввод
          </NavLink>
          {result && (
            <NavLink to="/result" className={link}>
              Результат
            </NavLink>
          )}
          <NavLink to="/decisions" className={link}>
            Черновые решения
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
