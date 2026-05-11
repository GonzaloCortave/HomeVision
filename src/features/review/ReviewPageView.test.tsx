import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
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
  it('renders review metadata, compact right rail, document viewer, and grouped issues', () => {
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
      screen.getByText(/7 current issues grouped by severity/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /review status/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /view all 7 issues/i }),
    ).toHaveAttribute('href', '#issues-panel')
    expect(
      screen.getByRole('heading', { level: 3, name: /^critical$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /^major$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /^minor$/i }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /critical issues/i })).getByRole(
        'heading',
        { name: /borrower income analysis/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /critical issues/i })).getByRole(
        'heading',
        { name: /collateral address does not match/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /major issues/i })).getByRole(
        'heading',
        { name: /flood certification/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /major issues/i })).getByRole(
        'heading',
        { name: /reviewer signature date is missing/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /minor issues/i })).getByRole(
        'heading',
        { name: /heading capitalization/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: /minor issues/i })).getByRole(
        'heading',
        { name: /supporting note wraps awkwardly/i },
      ),
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
    const documentPanel = container.querySelector(
      '#document-panel',
    ) as HTMLElement
    const reviewRail = screen.getByRole('complementary', {
      name: /review status/i,
    })
    const issuesPanel = container.querySelector('#issues-panel') as HTMLElement

    expect(documentPanel.compareDocumentPosition(reviewRail)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(reviewRail.compareDocumentPosition(issuesPanel)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('keeps issue cards out of the compact review rail', () => {
    const review = createReviewMock()

    renderReviewPageView(review)

    const reviewRail = screen.getByRole('complementary', {
      name: /review status/i,
    })
    const issuesSection = document.querySelector('#issues-panel') as HTMLElement

    expect(
      within(reviewRail).getByRole('heading', { name: /submission blocked/i }),
    ).toBeInTheDocument()
    expect(
      within(reviewRail).queryByText(/borrower income analysis is incomplete/i),
    ).not.toBeInTheDocument()
    expect(
      within(issuesSection).getByText(
        /borrower income analysis is incomplete/i,
      ),
    ).toBeInTheDocument()
  })

  it('provides mobile section links for issues and document access', () => {
    const review = createReviewMock()

    renderReviewPageView(review)

    const sectionLinks = screen.getAllByRole('link', {
      name: /^(document|issues)$/i,
    })

    expect(sectionLinks.map((link) => link.textContent)).toEqual([
      'Document',
      'Issues',
    ])
    expect(sectionLinks[0]).toHaveAttribute('href', '#document-panel')
    expect(sectionLinks[1]).toHaveAttribute('href', '#issues-panel')
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
    expect(screen.queryByRole('link', { name: /view all/i })).toBeNull()
    expect(
      screen.getByRole('button', { name: /submit review/i }),
    ).toBeDisabled()
    expect(
      screen.getByRole('heading', { name: /document required/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/upload a corrected document/i)).toHaveLength(2)
  })

  it('blocks submission when critical or major issues are present', () => {
    const review = createReviewMock('blocked')

    renderReviewPageView(review)

    expect(
      screen.getByRole('heading', { name: /submission blocked/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /4 blocking issues must be fixed in the source document/i,
      ),
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
