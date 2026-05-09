import type { Review } from '../domain/reviewTypes'
import { createReviewMock, type ReviewMockVariant } from './reviewMock'

export interface LoadReviewOptions {
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

  return createReviewMock(options.variant)
}
