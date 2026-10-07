import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <Card className="max-w-xl text-center">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">МИТОпаспорт</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">Врачебный калькулятор интерпретации</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Помогает структурировать результаты МИТО-паспорта по пособию «Интерпретация митопаспорта»: по каждому показателю
          — зона, по группам показателей — функциональные контуры, по сочетаниям — паттерны с выбором ведущего.
        </p>
        <p className="mt-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-relaxed text-ink-soft">
          Калькулятор предназначен для врачей. Не является диагностической системой и не заменяет клиническое мышление.
        </p>
        <Button className="mt-8 w-full sm:w-auto" onClick={() => navigate('/input')}>
          Начать интерпретацию
        </Button>
      </Card>
    </div>
  )
}
