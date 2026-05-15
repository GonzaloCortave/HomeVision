import Button from '../../../shared/components/ui/Button'

export type ReviewPageErrorStateProps = {
  message: string
  onRetry: () => void
}

const ReviewPageLoadingState = () => (
  <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <header className="border-b border-indigo-100 pb-5">
        <p className="text-sm font-semibold uppercase text-indigo-600">
          HomeVision review
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Loading review
        </h1>
      </header>
      <section
        aria-live="polite"
        className="rounded-lg border border-slate-200 bg-white px-4 py-8 shadow-sm"
        role="status"
      >
        <h2 className="text-lg font-semibold text-slate-950">
          Loading review data
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Retrieving the latest uploaded document and issue details.
        </p>
      </section>
    </div>
  </main>
)

const ReviewPageErrorState = ({
  message,
  onRetry,
}: ReviewPageErrorStateProps) => (
  <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <header className="border-b border-indigo-100 pb-5">
        <p className="text-sm font-semibold uppercase text-indigo-600">
          HomeVision review
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Review could not load
        </h1>
      </header>
      <section
        className="rounded-lg border border-red-200 bg-white px-4 py-8 shadow-sm"
        role="alert"
      >
        <h2 className="text-lg font-semibold text-red-800">
          Unable to load review data
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <Button className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      </section>
    </div>
  </main>
)

export { ReviewPageErrorState, ReviewPageLoadingState }
