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
    'The income analysis section is missing required support. Correct the source document so the reviewer can verify the borrower income calculation.',
}

const criticalCollateralIssue: ApiReviewIssue = {
  id: 'issue-004',
  severity: 'critical',
  page: 1,
  title: 'Collateral address does not match the packet',
  description:
    'The property address on the appraisal cover page does not match the address in the review packet. Confirm the source document reflects the same collateral address across every required section.',
}

const majorIssue: ApiReviewIssue = {
  id: 'issue-002',
  severity: 'major',
  page: 3,
  title: 'Flood certification is missing',
  description:
    'The packet does not include the flood certification needed for collateral review.',
}

const majorSignatureIssue: ApiReviewIssue = {
  id: 'issue-005',
  severity: 'major',
  page: 2,
  title: 'Reviewer signature date is missing',
  description:
    'The certification page includes the reviewer signature block, but the signature date is blank. Add the completed date to the source document.',
}

const minorIssue: ApiReviewIssue = {
  id: 'issue-003',
  severity: 'minor',
  page: 3,
  title: 'Heading capitalization is inconsistent',
  description: 'One section heading uses inconsistent capitalization.',
}

const minorFormattingIssue: ApiReviewIssue = {
  id: 'issue-006',
  severity: 'minor',
  page: 1,
  title: 'Supporting note wraps awkwardly',
  description:
    'A supporting note wraps onto a second line in the generated packet. This is cosmetic and can be ignored.',
}

const minorPunctuationIssue: ApiReviewIssue = {
  id: 'issue-007',
  severity: 'minor',
  page: 3,
  title: 'Trailing punctuation is inconsistent',
  description:
    'One bullet in the reviewer comments section ends without punctuation while neighboring bullets use periods.',
}

export const blockedReviewMock: ApiReview = {
  name: '123-maple-appraisal-review.pdf',
  uploaded_at: '2026-05-07T14:18:00.000Z',
  status: 'on_review',
  version: 2,
  user: reviewUser,
  issues: [
    criticalIssue,
    criticalCollateralIssue,
    majorIssue,
    majorSignatureIssue,
    minorIssue,
    minorFormattingIssue,
    minorPunctuationIssue,
  ],
  document: sampleDocument,
}

export const reviewMock = blockedReviewMock

export const minorOnlyReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-minor-only-review.pdf',
  uploaded_at: '2026-05-07T15:04:00.000Z',
  version: 3,
  issues: [minorIssue, minorFormattingIssue, minorPunctuationIssue],
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

export const createdWithIssuesReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-created-with-issues-review.pdf',
  status: 'created',
  version: 1,
}

export const processingReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  status: 'processing',
  version: 1,
}

export const processingWithIssuesReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-processing-with-issues-review.pdf',
  status: 'processing',
  version: 1,
}

export const submittedReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  status: 'submitted',
  version: 4,
}

export const submittedWithIssuesReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-submitted-with-issues-review.pdf',
  status: 'submitted',
  version: 5,
}

export const missingDocumentReviewMock: ApiReview = {
  ...noIssuesReviewMock,
  name: '123-maple-missing-document-review.pdf',
  document: {
    ...sampleDocument,
    url: null,
  },
}

export const missingDocumentWithIssuesReviewMock: ApiReview = {
  ...minorOnlyReviewMock,
  name: '123-maple-missing-document-with-issues-review.pdf',
  document: {
    ...sampleDocument,
    url: null,
  },
}

export const missingDocumentWithBlockingIssuesReviewMock: ApiReview = {
  ...blockedReviewMock,
  name: '123-maple-missing-document-with-blockers-review.pdf',
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
  createdWithIssues: createdWithIssuesReviewMock,
  processing: processingReviewMock,
  processingWithIssues: processingWithIssuesReviewMock,
  submitted: submittedReviewMock,
  submittedWithIssues: submittedWithIssuesReviewMock,
  missingDocument: missingDocumentReviewMock,
  missingDocumentWithIssues: missingDocumentWithIssuesReviewMock,
  missingDocumentWithBlockingIssues:
    missingDocumentWithBlockingIssuesReviewMock,
} as const

export function createReviewMock(
  variant: ReviewMockVariant = 'blocked',
): Review {
  return normalizeReview(reviewMockVariants[variant])
}

export type ReviewMock = ApiReview
export type ReviewMockVariant = keyof typeof reviewMockVariants
