export type ReviewStatus = 'created' | 'processing' | 'on_review' | 'submitted'

export type IssueSeverity = 'critical' | 'major' | 'minor'

export interface ReviewUser {
  readonly id: string
  readonly name: string
  readonly email?: string
}

export interface ReviewIssue {
  readonly id: string
  readonly severity: IssueSeverity
  readonly page: number | null
  readonly title: string
  readonly description?: string
}

export interface ReviewDocumentPage {
  readonly page_number: number
  readonly width: number
  readonly height: number
}

export interface ReviewDocument {
  readonly url: string | null
  readonly pages: readonly ReviewDocumentPage[]
}

export interface Review {
  readonly name: string
  readonly uploaded_at: string
  readonly status: ReviewStatus
  readonly version: number
  readonly user: ReviewUser
  readonly issues: readonly ReviewIssue[]
  readonly document: ReviewDocument
}

export interface ApiReviewUser {
  readonly id: string
  readonly name: string
  readonly email?: string
}

export interface ApiReviewIssue {
  readonly id: string
  readonly severity: IssueSeverity
  readonly page: number | string | null
  readonly title: string
  readonly description?: string
}

export interface ApiReviewDocumentPage {
  readonly page_number: number
  readonly width: number
  readonly height: number
}

export interface ApiReviewDocument {
  readonly url: string | null
  readonly pages?: readonly ApiReviewDocumentPage[]
}

export interface ApiReview {
  readonly name: string
  readonly uploaded_at: string
  readonly status: ReviewStatus
  readonly version: number
  readonly user: ApiReviewUser
  readonly issues: readonly ApiReviewIssue[]
  readonly document: ApiReviewDocument
}

const REVIEW_STATUS_VALUES: readonly ReviewStatus[] = [
  'created',
  'processing',
  'on_review',
  'submitted',
]

const ISSUE_SEVERITY_VALUES: readonly IssueSeverity[] = [
  'critical',
  'major',
  'minor',
]

export class ReviewContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReviewContractError'
  }
}

export function normalizeReview(apiReview: unknown): Review {
  const reviewSource = requireRecord(apiReview, 'review')
  const userSource = readRecord(reviewSource.user)
  const documentSource = readRecord(reviewSource.document)
  const issuesSource = reviewSource.issues

  if (!Array.isArray(issuesSource)) {
    throw new ReviewContractError('Review issues must be an array.')
  }

  return {
    name: normalizeString(reviewSource.name, 'Untitled review document'),
    uploaded_at: normalizeString(reviewSource.uploaded_at, ''),
    status: normalizeReviewStatus(reviewSource.status),
    version: normalizeVersion(reviewSource.version),
    user: {
      id: normalizeString(userSource.id, 'unknown-reviewer'),
      name: normalizeString(userSource.name, 'Unassigned reviewer'),
      email: normalizeOptionalString(userSource.email),
    },
    issues: normalizeIssues(issuesSource),
    document: {
      url: normalizeDocumentUrl(documentSource.url),
      pages: normalizeDocumentPages(documentSource.pages),
    },
  }
}

function normalizeIssues(issues: readonly unknown[]): ReviewIssue[] {
  const usedIds = new Set<string>()

  return issues.map((issue, index) => normalizeIssue(issue, index, usedIds))
}

function normalizeIssue(
  issue: unknown,
  index: number,
  usedIds: Set<string>,
): ReviewIssue {
  const issueSource = requireRecord(issue, `issue ${index + 1}`)

  return {
    id: normalizeIssueId(issueSource.id, index, usedIds),
    severity: normalizeIssueSeverity(issueSource.severity),
    page: normalizeIssuePage(issueSource.page),
    title: normalizeString(issueSource.title, `Issue ${index + 1}`),
    description: normalizeOptionalString(issueSource.description),
  }
}

function normalizeIssueId(
  value: unknown,
  index: number,
  usedIds: Set<string>,
): string {
  const fallbackId = `issue-${index + 1}`
  const candidateId = normalizeString(value, fallbackId)

  if (!usedIds.has(candidateId)) {
    usedIds.add(candidateId)

    return candidateId
  }

  const dedupedId = `${candidateId}-${index + 1}`
  usedIds.add(dedupedId)

  return dedupedId
}

function normalizeIssuePage(page: unknown): number | null {
  const pageNumber =
    typeof page === 'string' && page.trim().length > 0 ? Number(page) : page

  return typeof pageNumber === 'number' &&
    Number.isInteger(pageNumber) &&
    pageNumber > 0
    ? pageNumber
    : null
}

function normalizeDocumentPages(pages: unknown): ReviewDocumentPage[] {
  if (!Array.isArray(pages)) {
    return []
  }

  return pages.flatMap((page): ReviewDocumentPage[] => {
    const pageSource = readRecord(page)
    const pageNumber = normalizePositiveNumber(pageSource.page_number)

    if (pageNumber === null) {
      return []
    }

    return [
      {
        page_number: pageNumber,
        width: normalizePositiveNumber(pageSource.width) ?? 0,
        height: normalizePositiveNumber(pageSource.height) ?? 0,
      },
    ]
  })
}

function normalizeReviewStatus(status: unknown): ReviewStatus {
  if (isReviewStatus(status)) {
    return status
  }

  throw new ReviewContractError(
    `Unsupported review status received from API: ${formatUnknownValue(status)}.`,
  )
}

function normalizeIssueSeverity(severity: unknown): IssueSeverity {
  if (isIssueSeverity(severity)) {
    return severity
  }

  throw new ReviewContractError(
    `Unsupported issue severity received from API: ${formatUnknownValue(
      severity,
    )}.`,
  )
}

function normalizeVersion(version: unknown): number {
  return typeof version === 'number' && Number.isFinite(version) ? version : 0
}

function normalizePositiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null
}

function normalizeDocumentUrl(url: unknown): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()

  if (trimmedUrl.length === 0) {
    return null
  }

  if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
    return trimmedUrl
  }

  try {
    const parsedUrl = new URL(trimmedUrl)

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.toString()
      : null
  } catch {
    return null
  }
}

function normalizeOptionalString(value: unknown): string | undefined {
  const normalizedValue = normalizeString(value, '')

  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function normalizeString(value: unknown, fallbackValue: string): string {
  if (typeof value !== 'string') {
    return fallbackValue
  }

  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : fallbackValue
}

function isReviewStatus(status: unknown): status is ReviewStatus {
  return (
    typeof status === 'string' &&
    REVIEW_STATUS_VALUES.includes(status as ReviewStatus)
  )
}

function isIssueSeverity(severity: unknown): severity is IssueSeverity {
  return (
    typeof severity === 'string' &&
    ISSUE_SEVERITY_VALUES.includes(severity as IssueSeverity)
  )
}

function requireRecord(
  value: unknown,
  fieldDescription: string,
): Record<string, unknown> {
  if (isRecord(value)) {
    return value
  }

  throw new ReviewContractError(
    `Invalid review data: ${fieldDescription} must be an object.`,
  )
}

function readRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatUnknownValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`
  }

  if (value === null) {
    return 'null'
  }

  return typeof value
}
