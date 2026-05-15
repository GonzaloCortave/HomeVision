import { describe, expect, it } from 'vitest'
import {
  canSubmitReview,
  getBlockingIssues,
  getIssueCounts,
  getSubmissionState,
  groupIssuesBySeverity,
  hasOnlyMinorIssues,
  hasReviewDocument,
  isBlockingIssue,
  sortIssuesBySeverityAndPage,
} from './reviewSelectors'
import {
  normalizeReview,
  ReviewContractError,
  type ApiReview,
  type IssueSeverity,
  type Review,
  type ReviewIssue,
  type ReviewStatus,
} from './reviewTypes'

function createIssue(
  severity: IssueSeverity,
  overrides: Partial<ReviewIssue> = {},
): ReviewIssue {
  return {
    id: `${severity}-issue`,
    severity,
    page: 1,
    title: `${severity} issue`,
    ...overrides,
  }
}

function createReview(overrides: Partial<Review> = {}): Review {
  return {
    name: 'sample-review.pdf',
    uploaded_at: '2026-05-07T14:18:00.000Z',
    status: 'on_review',
    version: 2,
    user: {
      id: 'user-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
    },
    issues: [],
    document: {
      url: '/local-sample-uploaded-document.pdf',
      pages: [
        {
          page_number: 1,
          width: 612,
          height: 792,
        },
      ],
    },
    ...overrides,
  }
}

describe('review selectors', () => {
  it('treats critical and major issues as blocking, but not minor issues', () => {
    expect(isBlockingIssue(createIssue('critical'))).toBe(true)
    expect(isBlockingIssue(createIssue('major'))).toBe(true)
    expect(isBlockingIssue(createIssue('minor'))).toBe(false)
  })

  it('returns blocking issues for critical and major severities only', () => {
    const criticalIssue = createIssue('critical')
    const majorIssue = createIssue('major')
    const minorIssue = createIssue('minor')

    expect(
      getBlockingIssues(
        createReview({
          issues: [minorIssue, criticalIssue, majorIssue],
        }),
      ),
    ).toEqual([criticalIssue, majorIssue])
  })

  it('allows submission for on-review reviews with no issues or only minor issues', () => {
    expect(canSubmitReview(createReview())).toBe(true)
    expect(
      canSubmitReview(
        createReview({
          issues: [createIssue('minor')],
        }),
      ),
    ).toBe(true)
  })

  it('blocks submission when the uploaded document URL is missing', () => {
    const missingDocumentReview = createReview({
      document: {
        url: null,
        pages: [],
      },
    })

    expect(hasReviewDocument(missingDocumentReview)).toBe(false)
    expect(canSubmitReview(missingDocumentReview)).toBe(false)
  })

  it('treats blank uploaded document URLs as missing', () => {
    const blankDocumentReview = createReview({
      document: {
        url: ' ',
        pages: [],
      },
    })

    expect(hasReviewDocument(blankDocumentReview)).toBe(false)
    expect(canSubmitReview(blankDocumentReview)).toBe(false)
  })

  it('blocks submission for critical-only, major-only, and mixed blocking issues', () => {
    const blockingIssueSets: ReviewIssue[][] = [
      [createIssue('critical')],
      [createIssue('major')],
      [createIssue('minor'), createIssue('critical'), createIssue('major')],
    ]

    for (const issues of blockingIssueSets) {
      expect(canSubmitReview(createReview({ issues }))).toBe(false)
    }
  })

  it('blocks submission unless the review status is on_review', () => {
    const statuses: ReviewStatus[] = ['created', 'processing', 'submitted']

    for (const status of statuses) {
      expect(canSubmitReview(createReview({ status }))).toBe(false)
    }
  })

  it('counts issues by severity and blocking status', () => {
    expect(
      getIssueCounts(
        createReview({
          issues: [
            createIssue('critical', { id: 'critical-1' }),
            createIssue('critical', { id: 'critical-2' }),
            createIssue('major'),
            createIssue('minor'),
          ],
        }),
      ),
    ).toEqual({
      critical: 2,
      major: 1,
      minor: 1,
      blocking: 3,
      total: 4,
    })
  })

  it('returns zero counts for severities that are not present', () => {
    expect(
      getIssueCounts(
        createReview({
          issues: [createIssue('minor')],
        }),
      ),
    ).toEqual({
      critical: 0,
      major: 0,
      minor: 1,
      blocking: 0,
      total: 1,
    })
  })

  it('sorts issues by severity, then page, then title, then id without mutating input', () => {
    const inputIssues = [
      createIssue('minor', { id: 'minor-b', page: 1, title: 'Zoning typo' }),
      createIssue('major', {
        id: 'major-no-page',
        page: null,
        title: 'Page reference missing',
      }),
      createIssue('critical', {
        id: 'critical-page-4',
        page: 4,
        title: 'Missing income support',
      }),
      createIssue('major', {
        id: 'major-page-2',
        page: 2,
        title: 'Flood certificate absent',
      }),
      createIssue('critical', {
        id: 'critical-page-1',
        page: 1,
        title: 'Unsigned appraisal',
      }),
      createIssue('minor', { id: 'minor-a', page: 1, title: 'Address typo' }),
    ]
    const review = createReview({ issues: inputIssues })

    expect(
      sortIssuesBySeverityAndPage(review).map((issue) => issue.id),
    ).toEqual([
      'critical-page-1',
      'critical-page-4',
      'major-page-2',
      'major-no-page',
      'minor-a',
      'minor-b',
    ])
    expect(review.issues).toEqual(inputIssues)
  })

  it('groups issues by severity using the deterministic issue order', () => {
    const review = createReview({
      issues: [
        createIssue('minor', { id: 'minor-page-3', page: 3 }),
        createIssue('critical', { id: 'critical-page-2', page: 2 }),
        createIssue('major', { id: 'major-page-5', page: 5 }),
        createIssue('critical', { id: 'critical-page-1', page: 1 }),
      ],
    })

    const groups = groupIssuesBySeverity(review)

    expect(groups.critical.map((issue) => issue.id)).toEqual([
      'critical-page-1',
      'critical-page-2',
    ])
    expect(groups.major.map((issue) => issue.id)).toEqual(['major-page-5'])
    expect(groups.minor.map((issue) => issue.id)).toEqual(['minor-page-3'])
  })

  it('identifies minor-only reviews', () => {
    expect(
      hasOnlyMinorIssues(createReview({ issues: [createIssue('minor')] })),
    ).toBe(true)
    expect(hasOnlyMinorIssues(createReview())).toBe(false)
    expect(
      hasOnlyMinorIssues(
        createReview({ issues: [createIssue('minor'), createIssue('major')] }),
      ),
    ).toBe(false)
  })

  it('describes blocked, ready, missing-document, and non-reviewable submission states', () => {
    expect(
      getSubmissionState(createReview({ issues: [createIssue('critical')] })),
    ).toMatchObject({
      state: 'blocked',
      canSubmit: false,
      reviewStatus: 'on_review',
    })
    expect(
      getSubmissionState(createReview({ issues: [createIssue('minor')] })),
    ).toMatchObject({
      state: 'ready',
      canSubmit: true,
      reviewStatus: 'on_review',
      hasMinorIssues: true,
    })
    expect(getSubmissionState(createReview())).toMatchObject({
      state: 'ready',
      canSubmit: true,
      reviewStatus: 'on_review',
      hasMinorIssues: false,
    })
    expect(
      getSubmissionState(
        createReview({
          document: {
            url: null,
            pages: [],
          },
        }),
      ),
    ).toMatchObject({
      state: 'missing_document',
      canSubmit: false,
      reviewStatus: 'on_review',
    })
  })

  it('gives missing documents precedence over blocking issues', () => {
    expect(
      getSubmissionState(
        createReview({
          document: {
            url: null,
            pages: [],
          },
          issues: [createIssue('critical')],
        }),
      ),
    ).toMatchObject({
      state: 'missing_document',
      canSubmit: false,
      reviewStatus: 'on_review',
      issueCounts: {
        critical: 1,
        blocking: 1,
      },
    })
  })

  it('reports all non-reviewable statuses in submission state', () => {
    const statuses: ReviewStatus[] = ['created', 'processing', 'submitted']

    for (const status of statuses) {
      expect(getSubmissionState(createReview({ status }))).toMatchObject({
        state: 'not_reviewable',
        canSubmit: false,
        reviewStatus: status,
      })
    }
  })

  it('normalizes API reviews into isolated domain objects', () => {
    const apiReview: ApiReview = {
      ...createReview({
        issues: [createIssue('minor')],
      }),
      issues: [createIssue('minor')],
      document: {
        url: '/local-sample-uploaded-document.pdf',
        pages: [
          {
            page_number: 1,
            width: 612,
            height: 792,
          },
        ],
      },
    }

    const normalizedReview = normalizeReview(apiReview)

    expect(normalizedReview).toEqual(apiReview)
    expect(normalizedReview).not.toBe(apiReview)
    expect(normalizedReview.user).not.toBe(apiReview.user)
    expect(normalizedReview.issues).not.toBe(apiReview.issues)
    expect(normalizedReview.document).not.toBe(apiReview.document)
    expect(normalizedReview.document.pages).not.toBe(apiReview.document.pages)
  })

  it('normalizes missing optional display fields while preserving safe review behavior', () => {
    const normalizedReview = normalizeReview({
      name: '',
      uploaded_at: '',
      status: 'on_review',
      version: undefined,
      user: null,
      issues: [
        {
          id: '',
          severity: 'minor',
          page: '2',
          title: '',
        },
        {
          id: '',
          severity: 'minor',
          page: -1,
          title: '',
        },
      ],
      document: {
        url: '/local-sample-uploaded-document.pdf',
      },
    })

    expect(normalizedReview).toMatchObject({
      name: 'Untitled review document',
      uploaded_at: '',
      status: 'on_review',
      version: 1,
      user: {
        id: 'unknown-reviewer',
        name: 'Unassigned reviewer',
      },
      document: {
        url: '/local-sample-uploaded-document.pdf',
        pages: [],
      },
    })
    expect(normalizedReview.issues).toEqual([
      {
        id: 'issue-1',
        severity: 'minor',
        page: 2,
        title: 'Issue 1',
        description: undefined,
      },
      {
        id: 'issue-2',
        severity: 'minor',
        page: null,
        title: 'Issue 2',
        description: undefined,
      },
    ])
  })

  it('throws controlled contract errors for submission-critical malformed API data', () => {
    expect(() =>
      normalizeReview({
        ...createReview(),
        issues: undefined,
      }),
    ).toThrow(ReviewContractError)

    expect(() =>
      normalizeReview({
        ...createReview(),
        status: 'ready_for_review',
      }),
    ).toThrow(/unsupported review status/i)

    expect(() =>
      normalizeReview({
        ...createReview(),
        issues: [
          {
            id: 'issue-001',
            severity: 'blocker',
            page: 1,
            title: 'Unknown severity issue',
          },
        ],
      }),
    ).toThrow(/unsupported issue severity/i)
  })

  it('normalizes blank API document URLs to explicit null values', () => {
    const normalizedReview = normalizeReview(
      createReview({
        document: {
          url: '   ',
          pages: [],
        },
      }),
    )

    expect(normalizedReview.document.url).toBeNull()
  })

  it('normalizes invalid API versions to a positive fallback version', () => {
    for (const version of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        normalizeReview({
          ...createReview(),
          version,
        }).version,
      ).toBe(1)
    }
  })

  it('trims API document URLs during normalization', () => {
    const normalizedReview = normalizeReview(
      createReview({
        document: {
          url: '  /local-sample-uploaded-document.pdf  ',
          pages: [],
        },
      }),
    )

    expect(normalizedReview.document.url).toBe(
      '/local-sample-uploaded-document.pdf',
    )
  })

  it('allows only supported API document URL formats', () => {
    expect(
      normalizeReview(
        createReview({
          document: {
            url: 'https://example.com/review-document',
            pages: [],
          },
        }),
      ).document.url,
    ).toBe('https://example.com/review-document')
    expect(
      normalizeReview(
        createReview({
          document: {
            url: 'http://example.com/review-document',
            pages: [],
          },
        }),
      ).document.url,
    ).toBe('http://example.com/review-document')

    for (const unsupportedUrl of [
      'N/A',
      'about:blank',
      'javascript:alert(1)',
      'documents/review.pdf',
      '//example.com/review.pdf',
    ]) {
      expect(
        normalizeReview(
          createReview({
            document: {
              url: unsupportedUrl,
              pages: [],
            },
          }),
        ).document.url,
      ).toBeNull()
    }
  })
})
