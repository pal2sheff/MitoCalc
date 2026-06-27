import type { ReactNode } from 'react'

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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-brand select-none">
        <span>{summary}</span>
        <svg
          className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-150 group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path d="M5 7.5 10 12.5 15 7.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="mt-3 text-sm text-ink-soft">{children}</div>
    </details>
  )
}
