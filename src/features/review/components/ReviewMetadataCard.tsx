import type { ReactNode } from 'react'

export type ReviewMetadataCardProps = {
  label: string
  secondaryValue?: ReactNode
  value: ReactNode
}

const ReviewMetadataCard = ({
  label,
  secondaryValue,
  value,
}: ReviewMetadataCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
    <dd className="mt-1 font-medium text-slate-950">{value}</dd>
    {secondaryValue ? (
      <dd className="mt-0.5 truncate text-xs text-slate-500">
        {secondaryValue}
      </dd>
    ) : null}
  </div>
)

export default ReviewMetadataCard
