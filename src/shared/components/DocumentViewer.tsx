import { ExternalLink } from 'lucide-react'
import TextLink from './ui/TextLink'

export type DocumentViewerProps = {
  documentUrl: string | null
  missingDocumentDescription?: string
  missingDocumentTitle?: string
  title?: string
  titleHeadingLevel?: 'h2' | 'h3'
}

const DEFAULT_MISSING_DOCUMENT_DESCRIPTION =
  'This document cannot be previewed because its URL is missing.'
const DEFAULT_MISSING_DOCUMENT_TITLE = 'Document unavailable'
const DEFAULT_TITLE = 'Document preview'

const DocumentViewer = ({
  documentUrl,
  missingDocumentDescription = DEFAULT_MISSING_DOCUMENT_DESCRIPTION,
  missingDocumentTitle = DEFAULT_MISSING_DOCUMENT_TITLE,
  title = DEFAULT_TITLE,
  titleHeadingLevel = 'h2',
}: DocumentViewerProps) => {
  const normalizedUrl = documentUrl?.trim()
  const TitleHeading = titleHeadingLevel

  if (!normalizedUrl) {
    return (
      <section
        aria-label={title}
        className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
      >
        <div className="max-w-sm">
          <TitleHeading className="text-base font-semibold text-slate-950">
            {missingDocumentTitle}
          </TitleHeading>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {missingDocumentDescription}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <TitleHeading className="text-sm font-semibold text-slate-950">
          {title}
        </TitleHeading>
        <TextLink
          aria-label={`Open searchable PDF in new tab: ${title}`}
          className="text-sm"
          href={normalizedUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open searchable PDF in new tab
          <ExternalLink aria-hidden="true" className="size-4" strokeWidth={2} />
        </TextLink>
      </div>
      <iframe
        className="h-[min(72vh,52rem)] w-full bg-slate-100"
        src={normalizedUrl}
        title={title}
      />
    </section>
  )
}

export default DocumentViewer
