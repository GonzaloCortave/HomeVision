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
      <a
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-800 shadow-sm hover:border-sky-300 hover:text-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        href={link.href}
        key={link.href}
      >
        {link.label}
      </a>
    ))}
  </nav>
)

export default ReviewSectionNav
