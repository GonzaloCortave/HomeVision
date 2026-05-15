import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockUploadDocument } from '../upload/data/uploadClient'
import { createReviewMock } from './data/reviewMock'
import {
  ReviewContractError,
  type Review,
  type ReviewIssue,
} from './domain/reviewTypes'
import ReviewPageContainer, { type ReviewLoader } from './ReviewPageContainer'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

const renderReviewPageContainer = (
  reviewPageContainer: ReactElement,
  initialEntries: readonly string[] = ['/review'],
) => {
  const RouterWrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[...initialEntries]}>{children}</MemoryRouter>
  )

  return render(reviewPageContainer, { wrapper: RouterWrapper })
}

describe('ReviewPageContainer', () => {
  it('renders the loading shell while review data is loading', () => {
    const loadReviewData = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading review data/i)
    expect(loadReviewData).toHaveBeenCalledTimes(1)
  })

  it('renders the loaded review after the async client resolves', async () => {
    const loadReviewData = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(loadReviewData).toHaveBeenCalledTimes(1)
  })

  it('loads stored mock reviews from the route review id', async () => {
    const { reviewId } = await mockUploadDocument({
      documentName: '123-maple-appraisal-review.pdf',
      variant: 'minorOnly',
      version: 3,
    })

    render(
      <MemoryRouter initialEntries={[`/review/${reviewId}`]}>
        <Routes>
          <Route element={<ReviewPageContainer />} path="/review/:reviewId" />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Version 3')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /ready to submit/i }),
    ).toBeInTheDocument()
  })

  it('returns to the loading shell when the loader changes', async () => {
    const firstLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )
    const secondLoader = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    expect(screen.getByRole('status')).toHaveTextContent(/loading review data/i)
    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).not.toBeInTheDocument()
    expect(secondLoader).toHaveBeenCalledTimes(1)
  })

  it('ignores stale successful loads after a newer loader resolves', async () => {
    const firstLoad = createDeferred<Review>()
    const secondLoad = createDeferred<Review>()
    const firstLoader = vi.fn<ReviewLoader>(() => firstLoad.promise)
    const secondLoader = vi.fn<ReviewLoader>(() => secondLoad.promise)

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    await act(async () => {
      secondLoad.resolve(createReviewMock('minorOnly'))
      await secondLoad.promise
    })

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-minor-only-review\.pdf/i,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      firstLoad.resolve(createReviewMock('blocked'))
      await firstLoad.promise
    })

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /123-maple-minor-only-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).not.toBeInTheDocument()
    expect(firstLoader).toHaveBeenCalledTimes(1)
    expect(secondLoader).toHaveBeenCalledTimes(1)
  })

  it('ignores stale rejected loads after a newer loader resolves', async () => {
    const firstLoad = createDeferred<Review>()
    const secondLoad = createDeferred<Review>()
    const firstLoader = vi.fn<ReviewLoader>(() => firstLoad.promise)
    const secondLoader = vi.fn<ReviewLoader>(() => secondLoad.promise)

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    await act(async () => {
      secondLoad.resolve(createReviewMock('noIssues'))
      await secondLoad.promise
    })

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()

    await act(async () => {
      firstLoad.reject(new Error('Stale review loader failure.'))
      await firstLoad.promise.catch(() => undefined)
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()
  })

  it('keeps showing loading during an A to B to A loader switch until fresh A data resolves', async () => {
    const firstLoader = vi.fn<ReviewLoader>()
    firstLoader
      .mockResolvedValueOnce(createReviewMock('noIssues'))
      .mockImplementationOnce(() => new Promise<Review>(() => {}))
    const secondLoader = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)
    rerender(<ReviewPageContainer loadReviewData={firstLoader} />)

    expect(screen.getByRole('status')).toHaveTextContent(/loading review data/i)
    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).not.toBeInTheDocument()
    expect(firstLoader).toHaveBeenCalledTimes(2)
    expect(secondLoader).toHaveBeenCalledTimes(1)
  })

  it('renders an error shell and retries loading', async () => {
    const loadReviewData = vi.fn<ReviewLoader>()
    loadReviewData
      .mockRejectedValueOnce(new Error('Mock review service outage.'))
      .mockResolvedValueOnce(createReviewMock('minorOnly'))

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /mock review service outage/i,
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-minor-only-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(loadReviewData).toHaveBeenCalledTimes(2)
  })

  it('renders an error shell when the loader throws synchronously', async () => {
    const loadReviewData = vi.fn<ReviewLoader>(() => {
      throw new Error('Synchronous loader failure.')
    })

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /synchronous loader failure/i,
    )
  })

  it('renders user-safe copy for review contract errors', async () => {
    const loadReviewData = vi.fn<ReviewLoader>(() => {
      throw new ReviewContractError(
        'Unsupported issue severity received from API: "blocker".',
      )
    })

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /review data is incomplete or uses an unsupported format/i,
    )
    expect(screen.getByRole('alert')).not.toHaveTextContent(/blocker/i)
  })

  it('marks a ready review submitted locally without calling a backend endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const loadReviewData = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )

    renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={loadReviewData} />,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: /submit review/i }),
    )

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submitted/i })).toBeDisabled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('scopes the local submitted confirmation to the current review version', async () => {
    const firstLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )
    const secondLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('minorOnly')),
    )

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: /submit review/i }),
    )

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-minor-only-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /review submitted/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit review/i })).toBeEnabled()
    expect(firstLoader).toHaveBeenCalledTimes(1)
    expect(secondLoader).toHaveBeenCalledTimes(1)
  })

  it('does not let local submitted state mask fresh blockers for the same review version', async () => {
    const firstReview = createReviewMock('noIssues')
    const blockingIssue: ReviewIssue = {
      id: 'fresh-blocker',
      severity: 'critical',
      page: 1,
      title: 'Fresh blocker after reload',
      description: 'Fresh review data now includes a blocking issue.',
    }
    const secondReview: Review = {
      ...firstReview,
      issues: [blockingIssue],
    }
    const firstLoader = vi.fn<ReviewLoader>(() => Promise.resolve(firstReview))
    const secondLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(secondReview),
    )

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: /submit review/i }),
    )

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    expect(
      await screen.findByRole('heading', {
        name: /fix blockers before submitting/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /review submitted/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit review/i }),
    ).toBeDisabled()
  })

  it('clears local submitted state when issue content changes on the same review version', async () => {
    const firstReview = createReviewMock('minorOnly')
    const secondReview: Review = {
      ...firstReview,
      issues: firstReview.issues.map((issue, index) =>
        index === 0
          ? {
              ...issue,
              description:
                'Updated minor issue guidance from fresh review data.',
            }
          : issue,
      ),
    }
    const firstLoader = vi.fn<ReviewLoader>(() => Promise.resolve(firstReview))
    const secondLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(secondReview),
    )

    const { rerender } = renderReviewPageContainer(
      <ReviewPageContainer loadReviewData={firstLoader} />,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: /submit review/i }),
    )

    expect(
      screen.getByRole('heading', { name: /review submitted/i }),
    ).toBeInTheDocument()

    rerender(<ReviewPageContainer loadReviewData={secondLoader} />)

    expect(
      await screen.findByText(/updated minor issue guidance/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /review submitted/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit review/i })).toBeEnabled()
  })
})

type Deferred<TValue> = {
  promise: Promise<TValue>
  reject: (reason: unknown) => void
  resolve: (value: TValue) => void
}

const createDeferred = <TValue,>(): Deferred<TValue> => {
  let rejectDeferred: (reason: unknown) => void = () => {}
  let resolveDeferred: (value: TValue) => void = () => {}
  const promise = new Promise<TValue>((resolve, reject) => {
    resolveDeferred = resolve
    rejectDeferred = reject
  })

  return {
    promise,
    reject: rejectDeferred,
    resolve: resolveDeferred,
  }
}
