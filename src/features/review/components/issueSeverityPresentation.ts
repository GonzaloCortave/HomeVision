import type { IssueSeverity } from '../domain/reviewTypes'

export type IssueSeverityPresentation = {
  badgeClassName: string
  label: string
}

export const issueSeverityPresentation: Record<
  IssueSeverity,
  IssueSeverityPresentation
> = {
  critical: {
    badgeClassName: 'border-red-200 bg-red-50 text-red-800',
    label: 'Critical',
  },
  major: {
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-800',
    label: 'Major',
  },
  minor: {
    badgeClassName: 'border-slate-200 bg-slate-50 text-slate-700',
    label: 'Minor',
  },
}
