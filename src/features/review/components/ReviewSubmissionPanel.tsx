import {
  CircleAlert,
  CheckCircle2,
  LockKeyhole,
  SendHorizontal,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import Button from '../../../shared/components/ui/Button'
import ButtonLink from '../../../shared/components/ui/ButtonLink'
import type { SubmissionState } from '../domain/reviewSelectors'
import { formatReviewStatus } from '../utils/reviewFormatters'

export type ReviewSubmissionPanelProps = {
  hasSubmittedReview: boolean
  onSubmitReview: () => void
  submissionState: SubmissionState
  uploadPageUrl: string
  uploadVersion: number
}

type ReviewSubmissionPanelContent = {
  canSubmit: boolean
  description: string
  Icon: LucideIcon
  iconClassName: string
  panelClassName: string
  statusLabel: string
  statusLabelClassName: string
  submitLabel: string
  title: string
  uploadAccessibleLabel: string
  uploadLabel: string
}

const SUBMISSION_HEADING_ID = 'review-submission-heading'
const SUBMISSION_HELPER_ID = 'review-submission-helper'

const ReviewSubmissionPanel = ({
  hasSubmittedReview,
  onSubmitReview,
  submissionState,
  uploadPageUrl,
  uploadVersion,
}: ReviewSubmissionPanelProps) => {
  const content = getReviewSubmissionPanelContent(
    submissionState,
    hasSubmittedReview,
    uploadVersion,
  )

  return (
    <section
      aria-describedby={SUBMISSION_HELPER_ID}
      aria-labelledby={SUBMISSION_HEADING_ID}
      className={`rounded-lg border bg-white p-4 shadow-sm ${content.panelClassName}`}
    >
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
            <h3
              className="mt-1 text-base font-semibold text-slate-950"
              id={SUBMISSION_HEADING_ID}
            >
              {content.title}
            </h3>
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${content.statusLabelClassName}`}
        >
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
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          aria-describedby={SUBMISSION_HELPER_ID}
          className="w-full"
          disabled={!content.canSubmit}
          onClick={onSubmitReview}
          variant={content.canSubmit ? 'primary' : 'secondary'}
        >
          {content.canSubmit ? (
            <SendHorizontal
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
          ) : (
            <LockKeyhole
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
          )}
          {content.submitLabel}
        </Button>
        <ButtonLink
          aria-label={content.uploadAccessibleLabel}
          aria-describedby={SUBMISSION_HELPER_ID}
          className="w-full"
          href={uploadPageUrl}
          size="md"
          variant={content.canSubmit ? 'secondary' : 'accent'}
        >
          <Upload aria-hidden="true" className="size-4" strokeWidth={2} />
          {content.uploadLabel}
        </ButtonLink>
      </div>
    </section>
  )
}

const getReviewSubmissionPanelContent = (
  submissionState: SubmissionState,
  hasSubmittedReview: boolean,
  uploadVersion: number,
): ReviewSubmissionPanelContent => {
  if (hasSubmittedReview) {
    return {
      canSubmit: false,
      description:
        'Submitted for this review session. Upload a new version if the document needs another change.',
      Icon: CheckCircle2,
      iconClassName: 'border-emerald-200 text-emerald-700',
      panelClassName: 'border-slate-200',
      statusLabel: 'Submitted',
      statusLabelClassName: 'border-slate-200 bg-slate-50 text-slate-700',
      submitLabel: 'Submitted',
      title: 'Review submitted',
      uploadAccessibleLabel: `Upload Version ${uploadVersion}`,
      uploadLabel: `Upload V${uploadVersion}`,
    }
  }

  switch (submissionState.state) {
    case 'blocked':
      return {
        canSubmit: false,
        description: `Resolve blockers in the source document, then upload Version ${uploadVersion}.`,
        Icon: LockKeyhole,
        iconClassName: 'border-slate-200 text-slate-700',
        panelClassName: 'border-slate-200',
        statusLabel: 'Blocked',
        statusLabelClassName: 'border-red-200 bg-red-50 text-red-700',
        submitLabel: 'Submit review',
        title: 'Fix blockers before submitting',
        uploadAccessibleLabel: `Upload Version ${uploadVersion}`,
        uploadLabel: `Upload V${uploadVersion}`,
      }
    case 'missing_document':
      return {
        canSubmit: false,
        description: `Upload the required document as Version ${uploadVersion}.`,
        Icon: CircleAlert,
        iconClassName: 'border-slate-200 text-slate-700',
        panelClassName: 'border-slate-200',
        statusLabel: 'Blocked',
        statusLabelClassName: 'border-red-200 bg-red-50 text-red-700',
        submitLabel: 'Submit review',
        title: 'Document required',
        uploadAccessibleLabel: `Upload Version ${uploadVersion}`,
        uploadLabel: `Upload V${uploadVersion}`,
      }
    case 'not_reviewable':
      return {
        canSubmit: false,
        description: `This review is ${formatReviewStatus(
          submissionState.reviewStatus,
        )}. Submit is available only while a review is on review.`,
        Icon: CircleAlert,
        iconClassName: 'border-slate-200 text-slate-600',
        panelClassName: 'border-slate-200',
        statusLabel: 'Unavailable',
        statusLabelClassName: 'border-slate-200 bg-slate-50 text-slate-700',
        submitLabel: 'Submit review',
        title: 'Submission unavailable',
        uploadAccessibleLabel: `Upload Version ${uploadVersion}`,
        uploadLabel: `Upload V${uploadVersion}`,
      }
    case 'ready':
      return {
        canSubmit: submissionState.canSubmit,
        description: submissionState.hasMinorIssues
          ? `Only minor issues remain. Submit this version, or upload Version ${uploadVersion} if it needs changes.`
          : `Submit this version, or upload Version ${uploadVersion} if it needs changes.`,
        Icon: CheckCircle2,
        iconClassName: 'border-emerald-200 text-emerald-700',
        panelClassName: 'border-slate-200',
        statusLabel: 'Ready',
        statusLabelClassName: 'border-slate-200 bg-slate-50 text-slate-700',
        submitLabel: 'Submit review',
        title: 'Ready to submit',
        uploadAccessibleLabel: `Upload Version ${uploadVersion}`,
        uploadLabel: `Upload V${uploadVersion}`,
      }
  }
}

export default ReviewSubmissionPanel
