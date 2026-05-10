import type { SubmissionState } from '../domain/reviewSelectors'
import type { ReviewIssue } from '../domain/reviewTypes'
import { formatIssueCount } from '../utils/reviewFormatters'
import IssueCard from './IssueCard'
import { REVIEW_SECTION_IDS } from './reviewSectionIds'
import ReviewSubmissionPanel from './ReviewSubmissionPanel'

export type IssuePanelProps = {
  hasSubmittedReview: boolean
  issues: readonly ReviewIssue[]
  onSubmitReview: () => void
  submissionState: SubmissionState
}

const IssuePanel = ({
  hasSubmittedReview,
  issues,
  onSubmitReview,
  submissionState,
}: IssuePanelProps) => {
  const issueCountLabel = formatIssueCount(issues.length)

  return (
    <aside
      aria-labelledby="issues-heading"
      className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1"
      id={REVIEW_SECTION_IDS.issues}
    >
      <div>
        <p className="text-sm font-semibold uppercase text-slate-500">
          Review panel
        </p>
        <h2
          className="mt-1 text-lg font-semibold text-slate-950"
          id="issues-heading"
        >
          Issues
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {issueCountLabel} on the latest uploaded document.
        </p>
      </div>
      <ReviewSubmissionPanel
        hasSubmittedReview={hasSubmittedReview}
        onSubmitReview={onSubmitReview}
        submissionState={submissionState}
      />
      {issues.length > 0 ? (
        <ol aria-label="Current review issues" className="space-y-3">
          {issues.map((issue) => (
            <IssueCard issue={issue} key={issue.id} />
          ))}
        </ol>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
          No issues found on the latest uploaded document.
        </div>
      )}
    </aside>
  )
}

export default IssuePanel
