import { normalizeReview, type Review } from '../domain/reviewTypes'

const MOCK_REVIEW_STORAGE_PREFIX = 'homevision:mock-review:'

export const saveMockReview = (reviewId: string, review: Review): void => {
  const storage = getSessionStorage()

  if (storage === null) {
    return
  }

  storage.setItem(getMockReviewStorageKey(reviewId), JSON.stringify(review))
}

export const loadStoredMockReview = (reviewId: string): Review | null => {
  const storage = getSessionStorage()

  if (storage === null) {
    return null
  }

  const serializedReview = storage.getItem(getMockReviewStorageKey(reviewId))

  if (serializedReview === null) {
    return null
  }

  try {
    return normalizeReview(JSON.parse(serializedReview))
  } catch {
    return null
  }
}

const getMockReviewStorageKey = (reviewId: string): string => {
  return `${MOCK_REVIEW_STORAGE_PREFIX}${reviewId}`
}

const getSessionStorage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}
