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
  it('keeps submit visible and sends blocked reviews to upload', () => {
    renderReviewSubmissionPanel(createReviewMock('blocked'))

    const helperText = screen.getByText(/resolve blockers/i)
    const submitButton = screen.getByRole('button', {
      name: /submit review/i,
    })
    const uploadLink = screen.getByRole('link', {
      name: /upload version 3/i,
    })
    const panel = screen.getByRole('region', {
      name: /fix blockers before submitting/i,
    })

    expect(panel).toHaveAccessibleDescription(
      /resolve blockers in the source document/i,
    )

    expect(
      screen.getByRole('heading', { name: /fix blockers before submitting/i }),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAccessibleDescription(/upload version 3/i)
    expect(uploadLink).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(helperText.id),
    )
    expect(uploadLink).toHaveAccessibleDescription(/upload version 3/i)
    expect(uploadLink).toHaveAttribute(
      'href',
      '/upload?currentVersion=2&documentName=123-maple-appraisal-review.pdf&nextVersion=3',
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
      /submit is available only while a review is on review/i,
    )
    expect(
      screen.getByRole('link', { name: /upload version/i }),
    ).toBeInTheDocument()
  })

  it('keeps submit visible and sends missing-document reviews to upload', () => {
    renderReviewSubmissionPanel(createReviewMock('missingDocument'))

    expect(
      screen.getByRole('heading', { name: /document required/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/upload the required document as version 5/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit review/i }),
    ).toBeDisabled()
    expect(
      screen.getByRole('link', {
        name: /upload version 5/i,
      }),
    ).toHaveAccessibleDescription(/required document as version 5/i)
    expect(
      screen.getByRole('link', {
        name: /upload version 5/i,
      }),
    ).toHaveAttribute(
      'href',
      '/upload?currentVersion=4&documentName=123-maple-missing-document-review.pdf&nextVersion=5',
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
      /submit this version, or upload version 5/i,
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
      /submitted for this review session/i,
    )
    expect(
      screen.getByRole('link', { name: /upload version 5/i }),
    ).toBeInTheDocument()
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
      uploadPageUrl={`/upload?currentVersion=${review.version}&documentName=${review.name}&nextVersion=${review.version + 1}`}
      uploadVersion={review.version + 1}
    />,
  )
}
