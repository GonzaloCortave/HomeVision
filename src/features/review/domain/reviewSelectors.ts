import type {
  IssueSeverity,
  Review,
  ReviewIssue,
  ReviewStatus,
} from './reviewTypes'

export const ISSUE_SEVERITIES = ['critical', 'major', 'minor'] as const

export const BLOCKING_SEVERITIES = ['critical', 'major'] as const

export const ISSUE_SEVERITY_ORDER: Record<IssueSeverity, number> = {
  critical: 0,
  major: 1,
  minor: 2,
}

const BLOCKING_SEVERITY_SET: ReadonlySet<IssueSeverity> = new Set(
  BLOCKING_SEVERITIES,
)

export interface IssueCounts {
  readonly critical: number
  readonly major: number
  readonly minor: number
  readonly blocking: number
  readonly total: number
}

export interface IssuesBySeverity {
  readonly critical: readonly ReviewIssue[]
  readonly major: readonly ReviewIssue[]
  readonly minor: readonly ReviewIssue[]
}

export type SubmissionState =
  | {
      readonly state: 'not_reviewable'
      readonly canSubmit: false
      readonly reviewStatus: Exclude<ReviewStatus, 'on_review'>
      readonly blockingIssues: readonly ReviewIssue[]
      readonly issueCounts: IssueCounts
    }
  | {
      readonly state: 'blocked'
      readonly canSubmit: false
      readonly reviewStatus: 'on_review'
      readonly blockingIssues: readonly ReviewIssue[]
      readonly issueCounts: IssueCounts
    }
  | {
      readonly state: 'missing_document'
      readonly canSubmit: false
      readonly reviewStatus: 'on_review'
      readonly blockingIssues: readonly ReviewIssue[]
      readonly issueCounts: IssueCounts
    }
  | {
      readonly state: 'ready'
      readonly canSubmit: true
      readonly reviewStatus: 'on_review'
      readonly hasMinorIssues: boolean
      readonly issueCounts: IssueCounts
    }

export function isBlockingSeverity(severity: IssueSeverity): boolean {
  return BLOCKING_SEVERITY_SET.has(severity)
}

export function isBlockingIssue(issue: ReviewIssue): boolean {
  return isBlockingSeverity(issue.severity)
}

export function getBlockingIssues(review: Review): ReviewIssue[] {
  return review.issues.filter(isBlockingIssue)
}

export function hasBlockingIssues(review: Review): boolean {
  return getBlockingIssues(review).length > 0
}

export function hasReviewDocument(review: Review): boolean {
  return (
    typeof review.document.url === 'string' &&
    review.document.url.trim().length > 0
  )
}

export function canSubmitReview(review: Review): boolean {
  return (
    review.status === 'on_review' &&
    !hasBlockingIssues(review) &&
    hasReviewDocument(review)
  )
}

export function getIssueCounts(review: Review): IssueCounts {
  const counts = {
    critical: 0,
    major: 0,
    minor: 0,
    blocking: 0,
    total: review.issues.length,
  }

  for (const issue of review.issues) {
    counts[issue.severity] += 1

    if (isBlockingIssue(issue)) {
      counts.blocking += 1
    }
  }

  return counts
}

export function sortIssuesBySeverityAndPage(review: Review): ReviewIssue[] {
  return [...review.issues].sort(compareIssuesBySeverityAndPage)
}

export function groupIssuesBySeverity(review: Review): IssuesBySeverity {
  const groups: {
    critical: ReviewIssue[]
    major: ReviewIssue[]
    minor: ReviewIssue[]
  } = {
    critical: [],
    major: [],
    minor: [],
  }

  for (const issue of sortIssuesBySeverityAndPage(review)) {
    groups[issue.severity].push(issue)
  }

  return groups
}

export function hasOnlyMinorIssues(review: Review): boolean {
  return review.issues.length > 0 && !hasBlockingIssues(review)
}

export function getSubmissionState(review: Review): SubmissionState {
  const issueCounts = getIssueCounts(review)
  const blockingIssues = getBlockingIssues(review)

  if (review.status !== 'on_review') {
    return {
      state: 'not_reviewable',
      canSubmit: false,
      reviewStatus: review.status,
      blockingIssues,
      issueCounts,
    }
  }

  if (blockingIssues.length > 0) {
    return {
      state: 'blocked',
      canSubmit: false,
      reviewStatus: review.status,
      blockingIssues,
      issueCounts,
    }
  }

  if (!hasReviewDocument(review)) {
    return {
      state: 'missing_document',
      canSubmit: false,
      reviewStatus: review.status,
      blockingIssues,
      issueCounts,
    }
  }

  return {
    state: 'ready',
    canSubmit: true,
    reviewStatus: review.status,
    hasMinorIssues: issueCounts.minor > 0,
    issueCounts,
  }
}

function compareIssuesBySeverityAndPage(
  firstIssue: ReviewIssue,
  secondIssue: ReviewIssue,
): number {
  const severityDelta =
    ISSUE_SEVERITY_ORDER[firstIssue.severity] -
    ISSUE_SEVERITY_ORDER[secondIssue.severity]

  if (severityDelta !== 0) {
    return severityDelta
  }

  const pageDelta = firstIssue.page - secondIssue.page

  if (pageDelta !== 0) {
    return pageDelta
  }

  const titleDelta = firstIssue.title.localeCompare(secondIssue.title)

  if (titleDelta !== 0) {
    return titleDelta
  }

  return firstIssue.id.localeCompare(secondIssue.id)
}
