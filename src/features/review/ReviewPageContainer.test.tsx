import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createReviewMock } from './data/reviewMock'
import type { Review } from './domain/reviewTypes'
import ReviewPageContainer, { type ReviewLoader } from './ReviewPageContainer'

afterEach(() => {
  cleanup()
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

    expect(await screen.findByRole('status')).toHaveTextContent(
      /loading review data/i,
    )
    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: /123-maple-clean-review\.pdf/i,
      }),
    ).not.toBeInTheDocument()
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

  it('marks a ready review submitted locally', async () => {
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
  })
})
