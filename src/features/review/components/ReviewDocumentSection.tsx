import DocumentViewer from '../../../shared/components/DocumentViewer'
import { REVIEW_SECTION_IDS } from './reviewSectionIds'

export type ReviewDocumentSectionProps = {
  documentUrl: string | null
  reviewName: string
}

const ReviewDocumentSection = ({
  documentUrl,
  reviewName,
}: ReviewDocumentSectionProps) => {
  return (
    <section
      aria-labelledby="document-heading"
      className="min-w-0"
      id={REVIEW_SECTION_IDS.document}
    >
      <div className="mb-3">
        <h2
          className="text-lg font-semibold text-slate-950"
          id="document-heading"
        >
          Document
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Latest uploaded version. Use the browser PDF viewer to search document
          text.
        </p>
      </div>
      <DocumentViewer
        documentUrl={documentUrl}
        missingDocumentDescription="An uploaded PDF is required for this review. The preview will be available after a corrected document is uploaded."
        title={`${reviewName} PDF`}
        titleHeadingLevel="h3"
      />
    </section>
  )
}

export default ReviewDocumentSection
