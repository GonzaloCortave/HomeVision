import { ChevronRight, ListChecks } from 'lucide-react'
import ButtonLink from '../../../shared/components/ui/ButtonLink'
import type { SubmissionState } from '../domain/reviewSelectors'
import type { ReviewIssue } from '../domain/reviewTypes'
import { formatIssueCount } from '../utils/reviewFormatters'
import { REVIEW_SECTION_IDS } from './reviewSectionIds'
import ReviewSummary from './ReviewSummary'
import ReviewSubmissionPanel from './ReviewSubmissionPanel'

export type IssuePanelProps = {
  hasSubmittedReview: boolean
  hasDocument: boolean
  issues: readonly ReviewIssue[]
  onSubmitReview: () => void
  submissionState: SubmissionState
  uploadPageUrl: string
  uploadVersion: number
}

const IssuePanel = ({
  hasDocument,
  hasSubmittedReview,
  issues,
  onSubmitReview,
  submissionState,
  uploadPageUrl,
  uploadVersion,
}: IssuePanelProps) => {
  const issueCountLabel = formatIssueCount(issues.length)
  const issueSourceCopy = hasDocument
    ? `${issueCountLabel} on the latest uploaded document.`
    : `${issueCountLabel} from review data. PDF preview unavailable.`

  return (
    <aside
      aria-labelledby="review-status-panel-heading"
      className="min-w-0 space-y-4 lg:sticky lg:top-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase text-slate-600">
          Review panel
        </p>
        <h2
          className="mt-1 text-lg font-semibold text-slate-950"
          id="review-status-panel-heading"
        >
          Review status
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {issueSourceCopy}
        </p>
      </div>
      <ReviewSummary submissionState={submissionState} />
      {issues.length > 0 ? (
        <ButtonLink
          className="w-full"
          href={`#${REVIEW_SECTION_IDS.issues}`}
          size="lg"
        >
          <ListChecks aria-hidden="true" className="size-4" strokeWidth={2} />
          View all {issues.length} issues
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </ButtonLink>
      ) : null}
      <ReviewSubmissionPanel
        hasSubmittedReview={hasSubmittedReview}
        onSubmitReview={onSubmitReview}
        submissionState={submissionState}
        uploadPageUrl={uploadPageUrl}
        uploadVersion={uploadVersion}
      />
    </aside>
  )
}

export default IssuePanel
