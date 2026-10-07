import type { HTMLAttributes } from 'react'

/** Лист бланка: белая поверхность с тонкой линией, без тени. */
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border border-line bg-paper p-5 sm:p-6 ${className}`} {...props} />
}

export function Panel({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-panel p-4 ${className}`} {...props} />
}

/** Раздел экрана: заголовок обычным регистром и тонкая линия под ним. */
export function Section({
  id,
  title,
  aside,
  children,
  className = '',
}: {
  id?: string
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`scroll-mt-6 ${className}`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {aside && <div className="text-sm text-ink-soft">{aside}</div>}
      </div>
      {children}
    </section>
  )
}
