import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReviewMock } from './data/reviewMock'
import {
  ReviewContractError,
  type Review,
  type ReviewIssue,
} from './domain/reviewTypes'
import ReviewPageContainer, { type ReviewLoader } from './ReviewPageContainer'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ReviewPageContainer', () => {
  it('renders the loading shell while review data is loading', () => {
    const loadReviewData = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

    expect(screen.getByRole('status')).toHaveTextContent(/loading review data/i)
    expect(loadReviewData).toHaveBeenCalledTimes(1)
  })

  it('renders the loaded review after the async client resolves', async () => {
    const loadReviewData = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(loadReviewData).toHaveBeenCalledTimes(1)
  })

  it('returns to the loading shell when the loader changes', async () => {
    const firstLoader = vi.fn<ReviewLoader>(() =>
      Promise.resolve(createReviewMock('noIssues')),
    )
    const secondLoader = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    const { rerender } = render(
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

  it('keeps showing loading during an A to B to A loader switch until fresh A data resolves', async () => {
    const firstLoader = vi.fn<ReviewLoader>()
    firstLoader
      .mockResolvedValueOnce(createReviewMock('noIssues'))
      .mockImplementationOnce(() => new Promise<Review>(() => {}))
    const secondLoader = vi.fn<ReviewLoader>(
      () => new Promise<Review>(() => {}),
    )

    const { rerender } = render(
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

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

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

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

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

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

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

    render(<ReviewPageContainer loadReviewData={loadReviewData} />)

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

    const { rerender } = render(
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

    const { rerender } = render(
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
      await screen.findByRole('heading', { name: /submission blocked/i }),
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

    const { rerender } = render(
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
