import {
  CircleAlert,
  CircleDashed,
  FileWarning,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { IssueCounts, SubmissionState } from '../domain/reviewSelectors'
import { formatReviewStatus } from '../utils/reviewFormatters'

export type ReviewSummaryProps = {
  submissionState: SubmissionState
}

type SummaryContent = {
  accentClassName: string
  eyebrow: string
  Icon: LucideIcon
  iconClassName: string
  title: string
  description: string
}

const severityCountItems: ReadonlyArray<{
  countKey: keyof Pick<IssueCounts, 'critical' | 'major' | 'minor'>
  label: string
  valueClassName: string
}> = [
  {
    countKey: 'critical',
    label: 'Critical',
    valueClassName: 'text-red-800',
  },
  {
    countKey: 'major',
    label: 'Major',
    valueClassName: 'text-amber-800',
  },
  {
    countKey: 'minor',
    label: 'Minor',
    valueClassName: 'text-slate-700',
  },
]

const ReviewSummary = ({ submissionState }: ReviewSummaryProps) => {
  const content = getSummaryContent(submissionState)
  const issueCounts = submissionState.issueCounts

  return (
    <section
      aria-labelledby="review-summary-heading"
      className={`rounded-lg border bg-white p-4 shadow-sm ${content.accentClassName}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border bg-white ${content.iconClassName}`}
        >
          <content.Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Review status
          </p>
          <h3
            className="mt-1 text-base font-semibold text-slate-950"
            id="review-summary-heading"
          >
            {content.title}
          </h3>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {content.description}
      </p>
      <dl
        aria-label="Issue counts by severity"
        className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      >
        {severityCountItems.map((item) => (
          <div
            className="border-r border-slate-200 px-3 py-2 last:border-r-0"
            key={item.countKey}
          >
            <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
            <dd className={`mt-1 text-lg font-semibold ${item.valueClassName}`}>
              {issueCounts[item.countKey]}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs font-medium uppercase text-slate-500">
        {content.eyebrow}
      </p>
    </section>
  )
}

const getSummaryContent = (
  submissionState: SubmissionState,
): SummaryContent => {
  switch (submissionState.state) {
    case 'blocked':
      return {
        accentClassName: 'border-red-200 ring-1 ring-red-100',
        description:
          'Critical and major issues must be resolved before this review can be submitted. Minor issues can remain.',
        eyebrow: `${submissionState.issueCounts.blocking} blocking ${
          submissionState.issueCounts.blocking === 1 ? 'issue' : 'issues'
        }`,
        Icon: CircleAlert,
        iconClassName: 'border-red-200 text-red-700',
        title: 'Blocked by critical or major issues',
      }
    case 'missing_document':
      return {
        accentClassName: 'border-red-200 ring-1 ring-red-100',
        description:
          'The uploaded document is unavailable. A document is required before this review can be submitted.',
        eyebrow:
          submissionState.issueCounts.blocking > 0
            ? `Document required; ${submissionState.issueCounts.blocking} blocking ${
                submissionState.issueCounts.blocking === 1 ? 'issue' : 'issues'
              }`
            : 'Document required',
        Icon: FileWarning,
        iconClassName: 'border-red-200 text-red-700',
        title: 'Document required',
      }
    case 'not_reviewable':
      return {
        accentClassName: 'border-slate-200',
        description: `This review is ${formatReviewStatus(
          submissionState.reviewStatus,
        )}. Reviews can only be submitted while they are on review.`,
        eyebrow: 'Not submittable',
        Icon: CircleDashed,
        iconClassName: 'border-slate-200 text-slate-600',
        title: 'Not ready for submission',
      }
    case 'ready':
      return {
        accentClassName: 'border-emerald-200 ring-1 ring-emerald-100',
        description: submissionState.hasMinorIssues
          ? 'Minor issues do not block submission. Review them if needed, or submit the review.'
          : 'Ready to submit. No critical or major issues remain.',
        eyebrow: 'Ready',
        Icon: ShieldCheck,
        iconClassName: 'border-emerald-200 text-emerald-700',
        title: 'No blockers remain',
      }
  }
}

export default ReviewSummary
