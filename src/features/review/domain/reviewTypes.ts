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
  readonly page: number
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
  readonly page: number
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
  readonly pages: readonly ApiReviewDocumentPage[]
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

export function normalizeReview(apiReview: ApiReview): Review {
  return {
    name: apiReview.name,
    uploaded_at: apiReview.uploaded_at,
    status: apiReview.status,
    version: apiReview.version,
    user: {
      id: apiReview.user.id,
      name: apiReview.user.name,
      email: apiReview.user.email,
    },
    issues: apiReview.issues.map((issue) => ({
      id: issue.id,
      severity: issue.severity,
      page: issue.page,
      title: issue.title,
      description: issue.description,
    })),
    document: {
      url: normalizeDocumentUrl(apiReview.document.url),
      pages: apiReview.document.pages.map((page) => ({
        page_number: page.page_number,
        width: page.width,
        height: page.height,
      })),
    },
  }
}

function normalizeDocumentUrl(url: string | null): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()

  return trimmedUrl.length > 0 ? trimmedUrl : null
}
