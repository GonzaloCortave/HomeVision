import {
  CircleAlert,
  CheckCircle2,
  LockKeyhole,
  SendHorizontal,
  type LucideIcon,
} from 'lucide-react'
import Button from '../../../shared/components/ui/Button'
import type { SubmissionState } from '../domain/reviewSelectors'
import { formatReviewStatus } from '../utils/reviewFormatters'

export type ReviewSubmissionPanelProps = {
  hasSubmittedReview: boolean
  onSubmitReview: () => void
  submissionState: SubmissionState
}

type ReviewSubmissionPanelContent = {
  buttonLabel: string
  ButtonIcon: LucideIcon
  description: string
  Icon: LucideIcon
  iconClassName: string
  isButtonDisabled: boolean
  statusLabel: string
  title: string
}

const SUBMISSION_HELPER_ID = 'review-submission-helper'

const ReviewSubmissionPanel = ({
  hasSubmittedReview,
  onSubmitReview,
  submissionState,
}: ReviewSubmissionPanelProps) => {
  const content = getReviewSubmissionPanelContent(
    submissionState,
    hasSubmittedReview,
  )

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border bg-slate-50 ${content.iconClassName}`}
          >
            <content.Icon
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-sky-700">
              Submission
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">
              {content.title}
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {content.statusLabel}
        </span>
      </div>
      <p
        aria-live="polite"
        className="mt-3 text-sm leading-6 text-slate-600"
        id={SUBMISSION_HELPER_ID}
      >
        {content.description}
      </p>
      <Button
        aria-describedby={SUBMISSION_HELPER_ID}
        className="mt-4 w-full sm:w-auto"
        disabled={content.isButtonDisabled}
        onClick={onSubmitReview}
      >
        <content.ButtonIcon
          aria-hidden="true"
          className="size-4"
          strokeWidth={2}
        />
        {content.buttonLabel}
      </Button>
    </section>
  )
}

const getReviewSubmissionPanelContent = (
  submissionState: SubmissionState,
  hasSubmittedReview: boolean,
): ReviewSubmissionPanelContent => {
  if (hasSubmittedReview) {
    return {
      buttonLabel: 'Submitted',
      ButtonIcon: CheckCircle2,
      description:
        'The review has been submitted locally for this review session.',
      Icon: CheckCircle2,
      iconClassName: 'border-emerald-200 text-emerald-700',
      isButtonDisabled: true,
      statusLabel: 'Submitted',
      title: 'Review submitted',
    }
  }

  switch (submissionState.state) {
    case 'blocked':
      return {
        buttonLabel: 'Submit review',
        ButtonIcon: LockKeyhole,
        description: `${formatBlockingIssueCount(
          submissionState.blockingIssues.length,
        )} must be fixed in the source document, then uploaded as a corrected version before submitting.`,
        Icon: LockKeyhole,
        iconClassName: 'border-slate-200 text-slate-700',
        isButtonDisabled: true,
        statusLabel: 'Blocked',
        title: 'Submission blocked',
      }
    case 'missing_document':
      return {
        buttonLabel: 'Submit review',
        ButtonIcon: LockKeyhole,
        description:
          'Upload a corrected document before submitting this review.',
        Icon: CircleAlert,
        iconClassName: 'border-red-200 text-red-700',
        isButtonDisabled: true,
        statusLabel: 'Blocked',
        title: 'Submission blocked',
      }
    case 'not_reviewable':
      return {
        buttonLabel: 'Submit review',
        ButtonIcon: LockKeyhole,
        description: `This review is ${formatReviewStatus(
          submissionState.reviewStatus,
        )}. Reviews can only be submitted while they are on review.`,
        Icon: CircleAlert,
        iconClassName: 'border-slate-200 text-slate-600',
        isButtonDisabled: true,
        statusLabel: 'Unavailable',
        title: 'Submission unavailable',
      }
    case 'ready':
      return {
        buttonLabel: 'Submit review',
        ButtonIcon: SendHorizontal,
        description: submissionState.hasMinorIssues
          ? 'Only minor issues remain. They do not block submission.'
          : 'No critical or major issues remain.',
        Icon: CheckCircle2,
        iconClassName: 'border-emerald-200 text-emerald-700',
        isButtonDisabled: !submissionState.canSubmit,
        statusLabel: 'Ready',
        title: 'Ready to submit',
      }
  }
}

const formatBlockingIssueCount = (blockingIssueCount: number): string => {
  return blockingIssueCount === 1
    ? '1 blocking issue'
    : `${blockingIssueCount} blocking issues`
}

export default ReviewSubmissionPanel
