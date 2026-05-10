import { describe, expect, it } from 'vitest'
import {
  formatIssueCount,
  formatReviewStatus,
  formatUploadedAt,
} from './reviewFormatters'

describe('reviewFormatters', () => {
  it('formats issue counts with singular and plural labels', () => {
    expect(formatIssueCount(0)).toBe('0 current issues')
    expect(formatIssueCount(1)).toBe('1 current issue')
    expect(formatIssueCount(2)).toBe('2 current issues')
  })

  it('formats review statuses for display', () => {
    expect(formatReviewStatus('created')).toBe('created')
    expect(formatReviewStatus('processing')).toBe('processing')
    expect(formatReviewStatus('on_review')).toBe('on review')
    expect(formatReviewStatus('submitted')).toBe('submitted')
  })

  it('returns the original upload timestamp when it cannot be parsed', () => {
    expect(formatUploadedAt('not-a-date')).toBe('not-a-date')
  })
})
