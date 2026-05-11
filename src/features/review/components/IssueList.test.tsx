import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ReviewIssue } from '../domain/reviewTypes'
import IssueList from './IssueList'

afterEach(() => {
  cleanup()
})

describe('IssueList', () => {
  it('renders all issues with severity, page, and blocking impact', () => {
    render(
      <IssueList
        ariaLabel="Review issues"
        emptyMessage="No issues found."
        issues={[
          createIssue({
            id: 'critical-001',
            page: 1,
            severity: 'critical',
            title: 'Collateral address does not match',
          }),
          createIssue({
            id: 'major-001',
            page: 2,
            severity: 'major',
            title: 'Flood certification is missing',
          }),
          createIssue({
            id: 'minor-001',
            page: 3,
            severity: 'minor',
            title: 'Heading capitalization is inconsistent',
          }),
        ]}
        titleHeadingLevel="h4"
      />,
    )

    const issueList = screen.getByRole('list', { name: /review issues/i })

    expect(within(issueList).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Major')).toBeInTheDocument()
    expect(screen.getByText('Minor')).toBeInTheDocument()
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByText('Page 3')).toBeInTheDocument()
    expect(screen.getAllByText('Blocks submission')).toHaveLength(2)
    expect(screen.getByText('Can be ignored')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /resolve/i })).toBeNull()
  })

  it('renders a clear empty state instead of an empty list', () => {
    render(
      <IssueList
        ariaLabel="Review issues"
        emptyMessage="No issues found on the latest uploaded document."
        issues={[]}
      />,
    )

    expect(screen.queryByRole('list', { name: /review issues/i })).toBeNull()
    expect(
      screen.getByText(/no issues found on the latest uploaded document/i),
    ).toBeInTheDocument()
  })
})

const createIssue = (overrides: Partial<ReviewIssue> = {}): ReviewIssue => {
  return {
    id: 'issue-001',
    severity: 'major',
    page: 1,
    title: 'Review issue',
    description: 'Review issue description.',
    ...overrides,
  }
}
