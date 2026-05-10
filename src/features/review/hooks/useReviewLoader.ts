import { useCallback, useEffect, useState } from 'react'
import type { Review } from '../domain/reviewTypes'

export type ReviewLoader = () => Promise<Review>

export type ReviewQueryState =
  | {
      status: 'loading'
    }
  | {
      status: 'success'
      data: Review
    }
  | {
      status: 'error'
      errorMessage: string
    }

export type UseReviewLoaderResult = {
  reviewQuery: ReviewQueryState
  retry: () => void
}

export const useReviewLoader = (
  loadReviewData: ReviewLoader,
): UseReviewLoaderResult => {
  const [reviewQuery, setReviewQuery] = useState<ReviewQueryState>({
    status: 'loading',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true
    let loadReviewPromise: Promise<Review>

    try {
      loadReviewPromise = loadReviewData()
    } catch (error: unknown) {
      loadReviewPromise = Promise.reject(error)
    }

    Promise.resolve()
      .then(() => {
        if (isCurrentRequest) {
          setReviewQuery({ status: 'loading' })
        }
      })
      .then(() => loadReviewPromise)
      .then((review) => {
        if (isCurrentRequest) {
          setReviewQuery({ status: 'success', data: review })
        }
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) {
          setReviewQuery({
            status: 'error',
            errorMessage: getReviewLoadErrorMessage(error),
          })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [loadReviewData, reloadKey])

  const retry = useCallback(() => {
    setReviewQuery({ status: 'loading' })
    setReloadKey((currentReloadKey) => currentReloadKey + 1)
  }, [])

  return {
    reviewQuery,
    retry,
  }
}

const getReviewLoadErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'Unable to load review data.'
}
