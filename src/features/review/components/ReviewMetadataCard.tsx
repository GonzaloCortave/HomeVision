import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type ReviewMetadataCardProps = {
  Icon?: LucideIcon
  label: string
  secondaryValue?: ReactNode
  value: ReactNode
}

const ReviewMetadataCard = ({
  Icon,
  label,
  secondaryValue,
  value,
}: ReviewMetadataCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
    <dt className="flex items-center gap-3 text-xs font-semibold uppercase text-slate-500">
      {Icon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
          <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </span>
      ) : null}
      <span>{label}</span>
    </dt>
    <dd
      className={['mt-1 font-medium text-slate-950', Icon ? 'pl-11' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {value}
    </dd>
    {secondaryValue ? (
      <dd
        className={[
          'mt-0.5 truncate text-xs text-slate-500',
          Icon ? 'pl-11' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {secondaryValue}
      </dd>
    ) : null}
  </div>
)

export default ReviewMetadataCard
