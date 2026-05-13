import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReviewContractError, type Review } from '../domain/reviewTypes'

export type ReviewLoader = () => Promise<Review>
type ReviewLoadRequestKey = symbol

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

type InternalReviewQueryState =
  | {
      status: 'loading'
      requestKey: ReviewLoadRequestKey
    }
  | {
      status: 'success'
      data: Review
      requestKey: ReviewLoadRequestKey
    }
  | {
      status: 'error'
      errorMessage: string
      requestKey: ReviewLoadRequestKey
    }

export type UseReviewLoaderResult = {
  reviewQuery: ReviewQueryState
  retry: () => void
}

export const useReviewLoader = (
  loadReviewData: ReviewLoader,
): UseReviewLoaderResult => {
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = useMemo(() => {
    void loadReviewData
    void reloadKey

    return Symbol('review-load-request')
  }, [loadReviewData, reloadKey])
  const [internalReviewQuery, setInternalReviewQuery] =
    useState<InternalReviewQueryState>({
      status: 'loading',
      requestKey,
    })

  useEffect(() => {
    let isCurrentRequest = true
    let loadReviewPromise: Promise<Review>

    try {
      loadReviewPromise = loadReviewData()
    } catch (error: unknown) {
      loadReviewPromise = Promise.reject(error)
    }

    loadReviewPromise
      .then((review) => {
        if (isCurrentRequest) {
          setInternalReviewQuery({
            status: 'success',
            data: review,
            requestKey,
          })
        }
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) {
          setInternalReviewQuery({
            status: 'error',
            errorMessage: getReviewLoadErrorMessage(error),
            requestKey,
          })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [loadReviewData, requestKey])

  const retry = useCallback(() => {
    setReloadKey((currentReloadKey) => currentReloadKey + 1)
  }, [])

  return {
    reviewQuery: getCurrentReviewQueryState(internalReviewQuery, requestKey),
    retry,
  }
}

const getCurrentReviewQueryState = (
  reviewQuery: InternalReviewQueryState,
  currentRequestKey: ReviewLoadRequestKey,
): ReviewQueryState => {
  if (reviewQuery.requestKey !== currentRequestKey) {
    return { status: 'loading' }
  }

  switch (reviewQuery.status) {
    case 'loading':
      return { status: 'loading' }
    case 'success':
      return { status: 'success', data: reviewQuery.data }
    case 'error':
      return {
        status: 'error',
        errorMessage: reviewQuery.errorMessage,
      }
  }
}

const getReviewLoadErrorMessage = (error: unknown): string => {
  if (error instanceof ReviewContractError) {
    return 'Review data is incomplete or uses an unsupported format. Retry after the review data is refreshed.'
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'Unable to load review data.'
}
