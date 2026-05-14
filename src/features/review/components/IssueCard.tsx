import { useId, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from '../../../shared/components/ui/Button'
import { isBlockingIssue } from '../domain/reviewSelectors'
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
  const blocksSubmission = isBlockingIssue(issue)
  const [isExpanded, setIsExpanded] = useState(false)
  const TitleHeading = titleHeadingLevel
  const canExpandDescription =
    (issue.description?.length ?? 0) > DESCRIPTION_EXPAND_THRESHOLD
  const isDescriptionCollapsed = canExpandDescription && !isExpanded
  const pageLabel =
    issue.page === null ? 'Page unavailable' : `Page ${issue.page}`
  const ExpandIcon = isExpanded ? ChevronUp : ChevronDown

  return (
    <li className="flex min-h-60 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severity.badgeClassName}`}
        >
          {severity.label}
        </span>
        <span className="text-xs font-medium text-slate-500">{pageLabel}</span>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
            blocksSubmission
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          {blocksSubmission ? 'Blocks submission' : 'Non-blocking'}
        </span>
      </div>
      <TitleHeading className="mt-3 text-sm font-semibold leading-6 text-slate-950">
        {issue.title}
      </TitleHeading>
      <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
        {blocksSubmission
          ? 'Fix this in the source document before submitting.'
          : 'This issue does not block submission.'}
      </p>
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
              <ExpandIcon
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2}
              />
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export default IssueCard
