import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReviewMock } from './data/reviewMock'
import {
  getSubmissionState,
  sortIssuesBySeverityAndPage,
} from './domain/reviewSelectors'
import type { Review } from './domain/reviewTypes'
import ReviewPageView from './ReviewPageView'

afterEach(() => {
  cleanup()
})

describe('ReviewPageView', () => {
  it('renders review metadata, the issue panel, and the uploaded document viewer', () => {
    const review = createReviewMock()

    const { container } = renderReviewPageView(review)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Version 2')).toBeInTheDocument()
    expect(screen.getByText('on review')).toBeInTheDocument()
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByText('alex.rivera@example.com')).toBeInTheDocument()
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      review.uploaded_at,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: /issues/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/3 current issues on the latest uploaded document/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /flood certification/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /document/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByTitle(/123-maple-appraisal-review\.pdf pdf/i),
    ).toHaveAttribute('src', '/local-sample-uploaded-document.pdf')
    expect(
      screen.getByRole('link', { name: /open document in new tab/i }),
    ).toHaveAttribute('href', '/local-sample-uploaded-document.pdf')
    expect(
      (
        container.querySelector('#document-panel') as HTMLElement
      ).compareDocumentPosition(
        container.querySelector('#issues-panel') as HTMLElement,
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('provides mobile section links for issues and document access', () => {
    const review = createReviewMock()

    renderReviewPageView(review)

    expect(screen.getByRole('link', { name: /^issues$/i })).toHaveAttribute(
      'href',
      '#issues-panel',
    )
    expect(screen.getByRole('link', { name: /^document$/i })).toHaveAttribute(
      'href',
      '#document-panel',
    )
  })

  it('renders the integrated missing-document state without hiding issues', () => {
    const review = createReviewMock('missingDocument')

    renderReviewPageView(review)

    expect(
      screen.getByRole('heading', { name: /document unavailable/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /issues/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/no issues found on the latest uploaded document/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit review/i }),
    ).toBeDisabled()
    expect(screen.getByText(/upload a corrected document/i)).toBeInTheDocument()
  })

  it('blocks submission when critical or major issues are present', () => {
    const review = createReviewMock('blocked')

    renderReviewPageView(review)

    expect(
      screen.getByRole('heading', { name: /submission blocked/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/2 blocking issues must be fixed in a new upload/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit review/i }),
    ).toBeDisabled()
  })

  it('enables submission when only minor issues remain', () => {
    const review = createReviewMock('minorOnly')
    const onSubmitReview = vi.fn()

    renderReviewPageView(review, { onSubmitReview })

    expect(screen.getByText(/only minor issues remain/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /submit review/i }))

    expect(onSubmitReview).toHaveBeenCalledTimes(1)
  })

  it('shows submitted confirmation when the container marks the review submitted', () => {
    const review = createReviewMock('noIssues')

    renderReviewPageView(review, { hasSubmittedReview: true })

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submitted/i })).toBeDisabled()
  })
})

const renderReviewPageView = (
  review: Review,
  options: {
    hasSubmittedReview?: boolean
    onSubmitReview?: () => void
  } = {},
) => {
  return render(
    <ReviewPageView
      hasSubmittedReview={options.hasSubmittedReview ?? false}
      issues={sortIssuesBySeverityAndPage(review)}
      onSubmitReview={options.onSubmitReview ?? vi.fn()}
      review={review}
      submissionState={getSubmissionState(review)}
    />,
  )
}
