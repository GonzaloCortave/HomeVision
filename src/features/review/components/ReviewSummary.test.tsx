import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createReviewMock } from '../data/reviewMock'
import { getSubmissionState } from '../domain/reviewSelectors'
import ReviewSummary from './ReviewSummary'

afterEach(() => {
  cleanup()
})

describe('ReviewSummary', () => {
  it('shows severity counts and external-fix copy for blocked reviews', () => {
    renderReviewSummary('blocked')

    expect(
      screen.getByRole('heading', {
        name: /blocked by critical or major issues/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/4 blocking issues/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /fix critical and major issues in the source document, then upload a corrected version/i,
      ),
    ).toBeInTheDocument()
    expectSeverityCount('Critical', '2')
    expectSeverityCount('Major', '2')
    expectSeverityCount('Minor', '3')
  })

  it('treats minor-only reviews as ready while preserving the minor count', () => {
    renderReviewSummary('minorOnly')

    expect(
      screen.getByRole('heading', { name: /no blockers remain/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /minor issues do not block submission. review them if needed, or submit the review/i,
      ),
    ).toBeInTheDocument()
    expectSeverityCount('Critical', '0')
    expectSeverityCount('Major', '0')
    expectSeverityCount('Minor', '3')
  })

  it('shows ready copy when no issues remain', () => {
    renderReviewSummary('noIssues')

    expect(screen.getByText(/ready to submit/i)).toBeInTheDocument()
    expect(
      screen.getByText(/no critical or major issues remain/i),
    ).toBeInTheDocument()
    expectSeverityCount('Critical', '0')
    expectSeverityCount('Major', '0')
    expectSeverityCount('Minor', '0')
  })

  it('does not make non-reviewable statuses look submittable', () => {
    renderReviewSummary('createdWithIssues')

    expect(
      screen.getByRole('heading', { name: /not ready for submission/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/this review is created/i)).toBeInTheDocument()
    expect(screen.getByText(/not submittable/i)).toBeInTheDocument()
    expectSeverityCount('Critical', '2')
    expectSeverityCount('Major', '2')
    expectSeverityCount('Minor', '3')
  })

  it('can show missing-document state with non-blocking issues', () => {
    renderReviewSummary('missingDocumentWithIssues')

    expect(
      screen.getByRole('heading', { name: /document required/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/uploaded document is unavailable/i),
    ).toBeInTheDocument()
    expectSeverityCount('Critical', '0')
    expectSeverityCount('Major', '0')
    expectSeverityCount('Minor', '3')
  })
})

const renderReviewSummary = (
  variant: Parameters<typeof createReviewMock>[0],
) => {
  const review = createReviewMock(variant)

  return render(<ReviewSummary submissionState={getSubmissionState(review)} />)
}

const expectSeverityCount = (label: string, count: string) => {
  const severityItem = screen.getByText(label).closest('div')

  expect(severityItem).not.toBeNull()
  expect(
    within(severityItem as HTMLElement).getByText(count),
  ).toBeInTheDocument()
}
