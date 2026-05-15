import type { Review } from '../domain/reviewTypes'
import { loadStoredMockReview } from './mockReviewStore'
import { createReviewMock, type ReviewMockVariant } from './reviewMock'

export interface LoadReviewOptions {
  readonly reviewId?: string
  readonly variant?: ReviewMockVariant
  readonly shouldReject?: boolean
}

export async function loadReview(
  options: LoadReviewOptions = {},
): Promise<Review> {
  await Promise.resolve()

  if (options.shouldReject === true) {
    throw new Error('Unable to load review data.')
  }

  if (options.reviewId !== undefined) {
    const review = loadStoredMockReview(options.reviewId)

    if (review === null) {
      throw new Error('Review not found.')
    }

    return review
  }

  return createReviewMock(options.variant)
}
