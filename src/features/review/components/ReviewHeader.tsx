import { CalendarDays, Clock3, FileText, UserRound } from 'lucide-react'
import type { Review } from '../domain/reviewTypes'
import { formatReviewStatus, formatUploadedAt } from '../utils/reviewFormatters'
import ReviewMetadataCard from './ReviewMetadataCard'

export type ReviewHeaderProps = {
  review: Review
}

const ReviewHeader = ({ review }: ReviewHeaderProps) => {
  const formattedUploadedAt = formatUploadedAt(review.uploaded_at)

  return (
    <header className="flex flex-col gap-5 border-b border-indigo-100 pb-5">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-indigo-600">
          HomeVision review
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
          {review.name}
        </h1>
      </div>
      <dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
        <ReviewMetadataCard
          Icon={Clock3}
          label="Status"
          value={formatReviewStatus(review.status)}
        />
        <ReviewMetadataCard
          Icon={FileText}
          label="Version"
          value={`Version ${review.version}`}
        />
        <ReviewMetadataCard
          Icon={CalendarDays}
          label="Uploaded"
          value={
            <time dateTime={review.uploaded_at}>{formattedUploadedAt}</time>
          }
        />
        <ReviewMetadataCard
          Icon={UserRound}
          label="Reviewer"
          secondaryValue={review.user.email}
          value={review.user.name}
        />
      </dl>
    </header>
  )
}

export default ReviewHeader
