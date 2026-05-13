import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReviewMock, type ReviewMockVariant } from '../data/reviewMock'
import { getSubmissionState } from '../domain/reviewSelectors'
import type { Review } from '../domain/reviewTypes'
import ReviewSubmissionPanel from './ReviewSubmissionPanel'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ReviewSubmissionPanel', () => {
  it('disables submit and exposes helper text when blocking issues exist', () => {
    renderReviewSubmissionPanel(createReviewMock('blocked'))

    const submitButton = screen.getByRole('button', { name: /submit review/i })
    const helperText = screen.getByText(
      /4 blocking issues must be fixed in the source document/i,
    )

    expect(
      screen.getByRole('heading', { name: /submission blocked/i }),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-describedby', helperText.id)
    expect(submitButton).toHaveAccessibleDescription(
      /4 blocking issues must be fixed in the source document/i,
    )
  })

  it.each<ReviewMockVariant>([
    'created',
    'createdWithIssues',
    'processing',
    'processingWithIssues',
    'submitted',
    'submittedWithIssues',
  ])('disables submit for %s reviews', (variant) => {
    renderReviewSubmissionPanel(createReviewMock(variant))

    const submitButton = screen.getByRole('button', {
      name: /submit review/i,
    })

    expect(
      screen.getByRole('heading', { name: /submission unavailable/i }),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAccessibleDescription(
      /reviews can only be submitted while they are on review/i,
    )
  })

  it('disables submit when the uploaded document is missing', () => {
    renderReviewSubmissionPanel(createReviewMock('missingDocument'))

    const submitButton = screen.getByRole('button', {
      name: /submit review/i,
    })

    expect(
      screen.getByRole('heading', { name: /submission blocked/i }),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAccessibleDescription(
      /upload a corrected document before submitting this review/i,
    )
  })

  it('enables submit when only minor issues remain', () => {
    const onSubmitReview = vi.fn()

    renderReviewSubmissionPanel(createReviewMock('minorOnly'), {
      onSubmitReview,
    })

    const submitButton = screen.getByRole('button', { name: /submit review/i })

    expect(submitButton).toBeEnabled()
    expect(submitButton).toHaveAccessibleDescription(
      /only minor issues remain/i,
    )

    fireEvent.click(submitButton)

    expect(onSubmitReview).toHaveBeenCalledTimes(1)
  })

  it('enables submit when no issues remain', () => {
    const onSubmitReview = vi.fn()

    renderReviewSubmissionPanel(createReviewMock('noIssues'), {
      onSubmitReview,
    })

    const submitButton = screen.getByRole('button', { name: /submit review/i })

    expect(submitButton).toBeEnabled()
    expect(submitButton).toHaveAccessibleDescription(
      /no critical or major issues remain/i,
    )

    fireEvent.click(submitButton)

    expect(onSubmitReview).toHaveBeenCalledTimes(1)
  })

  it('shows the local success state after the parent marks the review submitted', () => {
    renderReviewSubmissionPanel(createReviewMock('noIssues'), {
      hasSubmittedReview: true,
    })

    const submittedButton = screen.getByRole('button', { name: /submitted/i })

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()
    expect(submittedButton).toBeDisabled()
    expect(submittedButton).toHaveAccessibleDescription(
      /submitted locally for this review session/i,
    )
  })
})

const renderReviewSubmissionPanel = (
  review: Review,
  options: {
    hasSubmittedReview?: boolean
    onSubmitReview?: () => void
  } = {},
) => {
  return render(
    <ReviewSubmissionPanel
      hasSubmittedReview={options.hasSubmittedReview ?? false}
      onSubmitReview={options.onSubmitReview ?? vi.fn()}
      submissionState={getSubmissionState(review)}
    />,
  )
}
