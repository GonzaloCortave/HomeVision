import type { IssueSeverity, ReviewIssue } from '../domain/reviewTypes'
import { formatIssueCount } from '../utils/reviewFormatters'
import IssueList from './IssueList'
import { issueSeverityPresentation } from './issueSeverityPresentation'
import { REVIEW_SECTION_IDS } from './reviewSectionIds'

export type ReviewIssuesSectionProps = {
  issues: readonly ReviewIssue[]
}

type IssueGroupConfig = {
  severity: IssueSeverity
  heading: string
  emptyMessage: string
}

const issueGroups: readonly IssueGroupConfig[] = [
  {
    severity: 'critical',
    heading: 'Critical',
    emptyMessage: 'No critical issues.',
  },
  {
    severity: 'major',
    heading: 'Major',
    emptyMessage: 'No major issues.',
  },
  {
    severity: 'minor',
    heading: 'Minor',
    emptyMessage: 'No minor issues.',
  },
]

const ReviewIssuesSection = ({ issues }: ReviewIssuesSectionProps) => {
  const issueCountLabel = formatIssueCount(issues.length)

  return (
    <section
      aria-labelledby="issues-heading"
      className="scroll-mt-6 space-y-4"
      id={REVIEW_SECTION_IDS.issues}
    >
      <div>
        <p className="text-sm font-semibold uppercase text-slate-500">
          Review details
        </p>
        <h2
          className="mt-1 text-lg font-semibold text-slate-950"
          id="issues-heading"
        >
          Issues
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {issueCountLabel} grouped by severity.
        </p>
      </div>
      {issues.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {issueGroups.map((group) => (
            <IssueSeverityGroup
              issues={issues.filter(
                (issue) => issue.severity === group.severity,
              )}
              key={group.severity}
              {...group}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 px-4 py-6 text-sm text-emerald-800">
          No issues found on the latest uploaded document.
        </div>
      )}
    </section>
  )
}

const IssueSeverityGroup = ({
  emptyMessage,
  heading,
  issues,
  severity,
}: IssueGroupConfig & { issues: readonly ReviewIssue[] }) => {
  const presentation = issueSeverityPresentation[severity]

  return (
    <section
      aria-labelledby={`${severity}-issues-heading`}
      className="min-w-0 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          className="text-sm font-semibold text-slate-950"
          id={`${severity}-issues-heading`}
        >
          {heading}
        </h3>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${presentation.badgeClassName}`}
        >
          {issues.length}
        </span>
      </div>
      <IssueList
        ariaLabel={`${heading} issues`}
        emptyMessage={emptyMessage}
        issues={issues}
        titleHeadingLevel="h4"
      />
    </section>
  )
}

export default ReviewIssuesSection
