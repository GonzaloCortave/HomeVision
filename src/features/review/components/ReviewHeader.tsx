import type { Review } from '../domain/reviewTypes'

export type ReviewHeaderProps = {
  review: Review
}

const ReviewHeader = ({ review }: ReviewHeaderProps) => {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase text-sky-700">
          HomeVision
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          {review.name}
        </h1>
      </div>
      <dl className="flex flex-wrap gap-3 text-sm text-slate-600">
        <div>
          <dt className="sr-only">Version</dt>
          <dd>Version {review.version}</dd>
        </div>
        <div>
          <dt className="sr-only">Status</dt>
          <dd>{review.status.replace('_', ' ')}</dd>
        </div>
      </dl>
    </header>
  )
}

export default ReviewHeader
