import type { ReviewIssue } from '../domain/reviewTypes'
import { issueSeverityPresentation } from './issueSeverityPresentation'

export type IssueCardProps = {
  issue: ReviewIssue
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const severity = issueSeverityPresentation[issue.severity]

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severity.badgeClassName}`}
        >
          {severity.label}
        </span>
        <span className="text-xs font-medium text-slate-500">
          Page {issue.page}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-6 text-slate-950">
        {issue.title}
      </h3>
      {issue.description ? (
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {issue.description}
        </p>
      ) : null}
    </li>
  )
}

export default IssueCard
