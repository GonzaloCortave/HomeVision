import { useCallback, useState } from 'react'
import {
  ReviewPageErrorState,
  ReviewPageLoadingState,
} from './components/ReviewLoadStates'
import { loadReview } from './data/reviewClient'
import {
  getSubmissionState,
  sortIssuesBySeverityAndPage,
} from './domain/reviewSelectors'
import type { Review } from './domain/reviewTypes'
import { useReviewLoader, type ReviewLoader } from './hooks/useReviewLoader'
import ReviewPageView from './ReviewPageView'

export type ReviewPageContainerProps = {
  loadReviewData?: ReviewLoader
}

export type { ReviewLoader } from './hooks/useReviewLoader'

const defaultReviewLoader: ReviewLoader = () => loadReview()

const ReviewPageContainer = ({
  loadReviewData = defaultReviewLoader,
}: ReviewPageContainerProps) => {
  const { reviewQuery, retry } = useReviewLoader(loadReviewData)
  const [submittedReviewKey, setSubmittedReviewKey] = useState<string | null>(
    null,
  )
  const submissionState =
    reviewQuery.status === 'success'
      ? getSubmissionState(reviewQuery.data)
      : null
  const currentReviewKey =
    reviewQuery.status === 'success' ? getReviewKey(reviewQuery.data) : null
  const canSubmitCurrentReview = submissionState?.canSubmit ?? false
  const hasSubmittedReview =
    currentReviewKey !== null && submittedReviewKey === currentReviewKey

  const handleSubmitReview = useCallback(() => {
    if (currentReviewKey !== null && canSubmitCurrentReview) {
      setSubmittedReviewKey(currentReviewKey)
    }
  }, [canSubmitCurrentReview, currentReviewKey])

  if (reviewQuery.status === 'loading') {
    return <ReviewPageLoadingState />
  }

  if (reviewQuery.status === 'error') {
    return (
      <ReviewPageErrorState
        message={reviewQuery.errorMessage}
        onRetry={retry}
      />
    )
  }

  const review = reviewQuery.data

  return (
    <ReviewPageView
      hasSubmittedReview={hasSubmittedReview}
      issues={sortIssuesBySeverityAndPage(review)}
      onSubmitReview={handleSubmitReview}
      review={review}
      submissionState={getSubmissionState(review)}
    />
  )
}

const getReviewKey = (review: Review): string => {
  return `${review.name}:${review.version}`
}

export default ReviewPageContainer
