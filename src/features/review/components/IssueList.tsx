import type { ReviewIssue } from '../domain/reviewTypes'
import IssueCard from './IssueCard'

export type IssueListProps = {
  ariaLabel: string
  emptyMessage: string
  issues: readonly ReviewIssue[]
  titleHeadingLevel?: 'h3' | 'h4'
}

const IssueList = ({
  ariaLabel,
  emptyMessage,
  issues,
  titleHeadingLevel = 'h3',
}: IssueListProps) => {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ol aria-label={ariaLabel} className="space-y-3">
      {issues.map((issue) => (
        <IssueCard
          issue={issue}
          key={issue.id}
          titleHeadingLevel={titleHeadingLevel}
        />
      ))}
    </ol>
  )
}

export default IssueList
