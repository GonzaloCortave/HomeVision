import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ReviewIssue } from '../domain/reviewTypes'
import IssueCard from './IssueCard'

afterEach(() => {
  cleanup()
})

describe('IssueCard', () => {
  it('renders severity, page, title, and description', () => {
    render(
      <IssueCard
        issue={createIssue({
          description: 'The income support is missing.',
          page: 2,
          severity: 'critical',
          title: 'Borrower income analysis is incomplete',
        })}
      />,
    )

    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByText('Blocks submission')).toBeInTheDocument()
    expect(
      screen.getByText(/fix this in the source document before submitting/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: /borrower income analysis is incomplete/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/income support is missing/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show more/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /resolve/i })).toBeNull()
  })

  it('marks minor issues as non-blocking', () => {
    render(<IssueCard issue={createIssue({ severity: 'minor' })} />)

    expect(screen.getByText('Minor')).toBeInTheDocument()
    expect(screen.getByText('Non-blocking')).toBeInTheDocument()
    expect(
      screen.getByText(/this issue does not block submission/i),
    ).toBeInTheDocument()
  })

  it('renders a safe label when issue page is unavailable', () => {
    render(<IssueCard issue={createIssue({ page: null })} />)

    expect(screen.getByText('Page unavailable')).toBeInTheDocument()
  })

  it('omits the description block when no description is provided', () => {
    render(
      <IssueCard
        issue={createIssue({
          description: undefined,
          title: 'Heading capitalization is inconsistent',
        })}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: /heading capitalization is inconsistent/i,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/income support is missing/i)).toBeNull()
  })

  it('supports a lower heading level inside grouped issue sections', () => {
    render(
      <IssueCard
        issue={createIssue({ title: 'Flood certification is missing' })}
        titleHeadingLevel="h4"
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: /flood certification is missing/i,
      }),
    ).toBeInTheDocument()
  })

  it('does not visually truncate issue titles', () => {
    render(
      <IssueCard
        issue={createIssue({
          title:
            'Very long underwriting exception title that includes important reviewer context',
        })}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: /very long underwriting exception title/i,
      }),
    ).not.toHaveClass('line-clamp-2')
  })

  it('expands and collapses long issue descriptions', () => {
    render(
      <IssueCard
        issue={createIssue({
          description:
            'The property address on the appraisal cover page does not match the address in the review packet. Confirm the source document reflects the same collateral address across every required section before uploading a corrected version for review.',
        })}
      />,
    )

    const showMoreButton = screen.getByRole('button', {
      name: /show more for review issue/i,
    })

    expect(showMoreButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(showMoreButton)

    expect(
      screen.getByRole('button', { name: /show less for review issue/i }),
    ).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(
      screen.getByRole('button', { name: /show less for review issue/i }),
    )

    expect(
      screen.getByRole('button', { name: /show more for review issue/i }),
    ).toHaveAttribute('aria-expanded', 'false')
  })
})

const createIssue = (overrides: Partial<ReviewIssue> = {}): ReviewIssue => {
  return {
    id: 'issue-001',
    severity: 'major',
    page: 1,
    title: 'Review issue',
    ...overrides,
  }
}
