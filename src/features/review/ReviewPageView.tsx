import IssuePanel from './components/IssuePanel'
import ReviewDocumentSection from './components/ReviewDocumentSection'
import ReviewHeader from './components/ReviewHeader'
import ReviewIssuesSection from './components/ReviewIssuesSection'
import ReviewSectionNav from './components/ReviewSectionNav'
import {
  hasReviewDocument,
  type SubmissionState,
} from './domain/reviewSelectors'
import type { Review, ReviewIssue } from './domain/reviewTypes'

export type ReviewPageViewProps = {
  hasSubmittedReview: boolean
  issues: readonly ReviewIssue[]
  onSubmitReview: () => void
  review: Review
  submissionState: SubmissionState
}

const ReviewPageView = ({
  hasSubmittedReview,
  issues,
  onSubmitReview,
  review,
  submissionState,
}: ReviewPageViewProps) => {
  const hasDocument = hasReviewDocument(review)
  const uploadVersion = review.version + 1
  const uploadPageUrl = getUploadPageUrl(review, uploadVersion)

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <ReviewHeader review={review} />
        <ReviewSectionNav />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
          <ReviewDocumentSection
            documentUrl={review.document.url}
            reviewName={review.name}
          />
          <IssuePanel
            hasDocument={hasDocument}
            hasSubmittedReview={hasSubmittedReview}
            issues={issues}
            onSubmitReview={onSubmitReview}
            submissionState={submissionState}
            uploadPageUrl={uploadPageUrl}
            uploadVersion={uploadVersion}
          />
        </div>
        <ReviewIssuesSection hasDocument={hasDocument} issues={issues} />
      </div>
    </main>
  )
}

const getUploadPageUrl = (review: Review, uploadVersion: number): string => {
  const uploadSearchParams = new URLSearchParams({
    currentVersion: String(review.version),
    documentName: review.name,
    nextVersion: String(uploadVersion),
  })

  return `/upload?${uploadSearchParams.toString()}`
}

export default ReviewPageView
