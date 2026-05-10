import Button from '../../../shared/components/ui/Button'
import type { SubmissionState } from '../domain/reviewSelectors'
import { formatReviewStatus } from '../utils/reviewFormatters'

export type ReviewSubmissionPanelProps = {
  hasSubmittedReview: boolean
  onSubmitReview: () => void
  submissionState: SubmissionState
}

type SubmissionPanelContent = {
  buttonLabel: string
  description: string
  isButtonDisabled: boolean
  statusLabel: string
  title: string
}

const ReviewSubmissionPanel = ({
  hasSubmittedReview,
  onSubmitReview,
  submissionState,
}: ReviewSubmissionPanelProps) => {
  const content = getSubmissionPanelContent(submissionState, hasSubmittedReview)

  return (
    <section
      aria-labelledby="review-submission-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-sky-700">
            Submission
          </p>
          <h3
            className="mt-1 text-base font-semibold text-slate-950"
            id="review-submission-heading"
          >
            {content.title}
          </h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {content.statusLabel}
        </span>
      </div>
      <p aria-live="polite" className="mt-3 text-sm leading-6 text-slate-600">
        {content.description}
      </p>
      <Button
        className="mt-4 w-full sm:w-auto"
        disabled={content.isButtonDisabled}
        onClick={onSubmitReview}
      >
        {content.buttonLabel}
      </Button>
    </section>
  )
}

const getSubmissionPanelContent = (
  submissionState: SubmissionState,
  hasSubmittedReview: boolean,
): SubmissionPanelContent => {
  if (hasSubmittedReview) {
    return {
      buttonLabel: 'Submitted',
      description: 'The review has been marked submitted.',
      isButtonDisabled: true,
      statusLabel: 'Submitted',
      title: 'Review submitted',
    }
  }

  switch (submissionState.state) {
    case 'blocked':
      return {
        buttonLabel: 'Submit review',
        description: `${formatBlockingIssueCount(
          submissionState.blockingIssues.length,
        )} must be fixed in a new upload before this review can be submitted.`,
        isButtonDisabled: true,
        statusLabel: 'Blocked',
        title: 'Submission blocked',
      }
    case 'missing_document':
      return {
        buttonLabel: 'Submit review',
        description:
          'Upload a corrected document before submitting this review.',
        isButtonDisabled: true,
        statusLabel: 'Blocked',
        title: 'Submission blocked',
      }
    case 'not_reviewable':
      return {
        buttonLabel: 'Submit review',
        description: `This review is ${formatReviewStatus(
          submissionState.reviewStatus,
        )}. Reviews can only be submitted while they are on review.`,
        isButtonDisabled: true,
        statusLabel: 'Unavailable',
        title: 'Submission unavailable',
      }
    case 'ready':
      return {
        buttonLabel: 'Submit review',
        description: submissionState.hasMinorIssues
          ? 'Only minor issues remain. They do not block submission.'
          : 'No critical or major issues were found.',
        isButtonDisabled: false,
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
