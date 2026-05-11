import ButtonLink from '../../../shared/components/ui/ButtonLink'
import { REVIEW_SECTION_IDS } from './reviewSectionIds'

const reviewSectionLinks = [
  {
    href: `#${REVIEW_SECTION_IDS.document}`,
    label: 'Document',
  },
  {
    href: `#${REVIEW_SECTION_IDS.issues}`,
    label: 'Issues',
  },
] as const

const ReviewSectionNav = () => (
  <nav
    aria-label="Review sections"
    className="grid grid-cols-2 gap-2 lg:hidden"
  >
    {reviewSectionLinks.map((link) => (
      <ButtonLink href={link.href} key={link.href} size="sm">
        {link.label}
      </ButtonLink>
    ))}
  </nav>
)

export default ReviewSectionNav
