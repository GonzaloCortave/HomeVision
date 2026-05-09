import type {
  ApiReview,
  ApiReviewDocument,
  ApiReviewDocumentPage,
  ApiReviewIssue,
  ApiReviewUser,
  Review,
} from '../domain/reviewTypes'
import { normalizeReview } from '../domain/reviewTypes'

const reviewUser: ApiReviewUser = {
  id: 'user-001',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
}

const documentPages: readonly ApiReviewDocumentPage[] = [
  {
    page_number: 1,
    width: 612,
    height: 792,
  },
  {
    page_number: 2,
    width: 612,
    height: 792,
  },
  {
    page_number: 3,
    width: 612,
    height: 792,
  },
] as const

const sampleDocument: ApiReviewDocument = {
  url: '/local-sample-uploaded-document.pdf',
  pages: documentPages,
}

const criticalIssue: ApiReviewIssue = {
  id: 'issue-001',
  severity: 'critical',
  page: 2,
  title: 'Borrower income analysis is incomplete',
  description:
    'The income analysis section is missing required support. Correct the source document and upload a new version before submission.',
}

const majorIssue: ApiReviewIssue = {
  id: 'issue-002',
  severity: 'major',
  page: 3,
  title: 'Flood certification is missing',
  description:
    'The packet does not include the flood certification needed for collateral review. This blocks submission until the uploaded document is replaced.',
}

const minorIssue: ApiReviewIssue = {
  id: 'issue-003',
  severity: 'minor',
  page: 3,
  title: 'Heading capitalization is inconsistent',
  description:
    'One section heading uses inconsistent capitalization. This does not block submission.',
}

export const blockedReviewMock: ApiReview = {
  name: '123-maple-appraisal-review.pdf',
  uploaded_at: '2026-05-07T14:18:00.000Z',
  status: 'on_review',
  version: 2,
  user: reviewUser,
  issues: [criticalIssue, majorIssue, minorIssue],
  document: sampleDocument,
}

export const reviewMock = blockedReviewMock

export const minorOnlyReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-minor-only-review.pdf',
  uploaded_at: '2026-05-07T15:04:00.000Z',
  version: 3,
  issues: [minorIssue],
}

export const noIssuesReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-clean-review.pdf',
  uploaded_at: '2026-05-07T15:42:00.000Z',
  version: 4,
  issues: [],
}

export const createdReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  status: 'created',
  version: 1,
}

export const processingReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  status: 'processing',
  version: 1,
}

export const submittedReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  status: 'submitted',
  version: 4,
}

export const missingDocumentReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  name: '123-maple-missing-document-review.pdf',
  document: {
    ...sampleDocument,
    url: null,
  },
}

export const reviewMockVariants = {
  blocked: blockedReviewMock,
  minorOnly: minorOnlyReviewMock,
  noIssues: noIssuesReviewMock,
  created: createdReviewMock,
  processing: processingReviewMock,
  submitted: submittedReviewMock,
  missingDocument: missingDocumentReviewMock,
} as const

export function createReviewMock(
  variant: ReviewMockVariant = 'blocked',
): Review {
  return normalizeReview(reviewMockVariants[variant])
}

export type ReviewMock = ApiReview
export type ReviewMockVariant = keyof typeof reviewMockVariants
