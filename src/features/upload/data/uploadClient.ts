import type { Review } from '../../review/domain/reviewTypes'
import { saveMockReview } from '../../review/data/mockReviewStore'
import {
  createReviewMock,
  type ReviewMockVariant,
} from '../../review/data/reviewMock'

export type MockUploadDocumentOptions = {
  readonly documentName?: string
  readonly variant: ReviewMockVariant
  readonly version?: number
}

export type MockUploadDocumentResult = {
  readonly reviewId: string
}

// Mock API boundary for the demo upload flow. Replace with the real upload endpoint when available.
export const mockUploadDocument = async ({
  documentName,
  variant,
  version,
}: MockUploadDocumentOptions): Promise<MockUploadDocumentResult> => {
  await Promise.resolve()

  const reviewId = createMockReviewId()
  const review = createUploadedReviewMock({ documentName, variant, version })

  saveMockReview(reviewId, review)

  return { reviewId }
}

const createUploadedReviewMock = ({
  documentName,
  variant,
  version,
}: MockUploadDocumentOptions): Review => {
  const review = createReviewMock(variant)

  return {
    ...review,
    ...(documentName ? { name: documentName } : {}),
    ...(version === undefined ? {} : { version }),
    uploaded_at: new Date().toISOString(),
  }
}

const createMockReviewId = (): string => {
  return `mock-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
