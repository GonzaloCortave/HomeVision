import DocumentViewer from '../../shared/components/DocumentViewer'
import type { Review } from './domain/reviewTypes'
import ReviewHeader from './components/ReviewHeader'

export type ReviewPageProps = {
  review: Review
}

const ReviewPage = ({ review }: ReviewPageProps) => {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-4">
        <ReviewHeader review={review} />
        <DocumentViewer
          documentUrl={review.document.url}
          missingDocumentDescription="This review is missing an uploaded document URL. The PDF preview will be available after a corrected document is uploaded."
          title={`${review.name} PDF`}
        />
      </section>
    </main>
  )
}

export default ReviewPage
