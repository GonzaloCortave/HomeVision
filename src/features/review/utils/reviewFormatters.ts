import type { ReviewStatus } from '../domain/reviewTypes'

const uploadedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const reviewStatusLabels: Record<ReviewStatus, string> = {
  created: 'created',
  on_review: 'on review',
  processing: 'processing',
  submitted: 'submitted',
}

export const formatIssueCount = (issueCount: number): string => {
  return issueCount === 1 ? '1 current issue' : `${issueCount} current issues`
}

export const formatReviewStatus = (status: ReviewStatus): string => {
  return reviewStatusLabels[status]
}

export const formatUploadedAt = (uploadedAt: string): string => {
  const uploadDate = new Date(uploadedAt)

  if (Number.isNaN(uploadDate.getTime())) {
    return uploadedAt
  }

  return uploadedAtFormatter.format(uploadDate)
}
