import type { ReactNode } from 'react'

/** Раскрывающийся блок: всё второстепенное прячется сюда. */
export function Accordion({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: {
  summary: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  return (
    <details className={`group ${className}`} open={defaultOpen}>
      <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-brand select-none hover:text-brand-dark">
        <svg
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-open:rotate-90"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M7.5 5 12.5 10 7.5 15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{summary}</span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </details>
  )
}
