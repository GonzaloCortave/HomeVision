import { useId, useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import type { ReviewIssue } from '../domain/reviewTypes'
import { issueSeverityPresentation } from './issueSeverityPresentation'

export type IssueCardProps = {
  issue: ReviewIssue
  titleHeadingLevel?: 'h3' | 'h4'
}

const DESCRIPTION_EXPAND_THRESHOLD = 150

const IssueCard = ({ issue, titleHeadingLevel = 'h3' }: IssueCardProps) => {
  const descriptionId = useId()
  const severity = issueSeverityPresentation[issue.severity]
  const [isExpanded, setIsExpanded] = useState(false)
  const TitleHeading = titleHeadingLevel
  const canExpandDescription =
    (issue.description?.length ?? 0) > DESCRIPTION_EXPAND_THRESHOLD
  const isDescriptionCollapsed = canExpandDescription && !isExpanded

  return (
    <li className="flex min-h-60 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
      <TitleHeading className="mt-3 text-sm font-semibold leading-6 text-slate-950">
        {issue.title}
      </TitleHeading>
      {issue.description ? (
        <div className="mt-1 flex flex-1 flex-col">
          <p
            className={`text-sm leading-6 text-slate-600 ${
              isDescriptionCollapsed ? 'line-clamp-3' : ''
            }`}
            id={descriptionId}
          >
            {issue.description}
          </p>
          {canExpandDescription ? (
            <Button
              aria-label={`${
                isExpanded ? 'Show less' : 'Show more'
              } for ${issue.title}`}
              aria-controls={descriptionId}
              aria-expanded={isExpanded}
              className="mt-auto w-fit pt-3"
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
              variant="text"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export default IssueCard
