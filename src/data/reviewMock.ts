const reviewUser = {
  id: 'user-001',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
} as const

const documentPages = [
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

const sampleDocument = {
  url: '/local-sample-uploaded-document.pdf',
  pages: documentPages,
} as const

const criticalIssue = {
  id: 'issue-001',
  severity: 'critical',
  page: 2,
  title: 'Borrower income analysis is incomplete',
  description:
    'The income analysis section is missing required support. Correct the source document and upload a new version before submission.',
} as const

const majorIssue = {
  id: 'issue-002',
  severity: 'major',
  page: 3,
  title: 'Flood certification is missing',
  description:
    'The packet does not include the flood certification needed for collateral review. This blocks submission until the uploaded document is replaced.',
} as const

const minorIssue = {
  id: 'issue-003',
  severity: 'minor',
  page: 3,
  title: 'Heading capitalization is inconsistent',
  description:
    'One section heading uses inconsistent capitalization. This does not block submission.',
} as const

export const blockedReviewMock = {
  name: '123-maple-appraisal-review.pdf',
  uploaded_at: '2026-05-07T14:18:00.000Z',
  status: 'on_review',
  version: 2,
  user: reviewUser,
  issues: [criticalIssue, majorIssue, minorIssue],
  document: sampleDocument,
} as const

export const reviewMock = blockedReviewMock

export const minorOnlyReviewMock = {
  ...blockedReviewMock,
  name: '123-maple-minor-only-review.pdf',
  uploaded_at: '2026-05-07T15:04:00.000Z',
  version: 3,
  issues: [minorIssue],
} as const

export const noIssuesReviewMock = {
  ...blockedReviewMock,
  name: '123-maple-clean-review.pdf',
  uploaded_at: '2026-05-07T15:42:00.000Z',
  version: 4,
  issues: [],
} as const

export const createdReviewMock = {
  ...noIssuesReviewMock,
  status: 'created',
  version: 1,
} as const

export const processingReviewMock = {
  ...noIssuesReviewMock,
  status: 'processing',
  version: 1,
} as const

export const submittedReviewMock = {
  ...noIssuesReviewMock,
  status: 'submitted',
  version: 4,
} as const

export const missingDocumentReviewMock = {
  ...blockedReviewMock,
  name: '123-maple-missing-document-review.pdf',
  document: {
    ...sampleDocument,
    url: '',
  },
} as const

export const reviewMockVariants = {
  blocked: blockedReviewMock,
  minorOnly: minorOnlyReviewMock,
  noIssues: noIssuesReviewMock,
  created: createdReviewMock,
  processing: processingReviewMock,
  submitted: submittedReviewMock,
  missingDocument: missingDocumentReviewMock,
} as const

export type ReviewMock = typeof reviewMock
export type ReviewMockVariant = keyof typeof reviewMockVariants
