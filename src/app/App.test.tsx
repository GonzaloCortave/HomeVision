import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { mockUploadDocument } from '../features/upload/data/uploadClient'
import App from './App'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('renders the review page by default', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /fix blockers before submitting/i }),
    ).toBeInTheDocument()
  })

  it('navigates from upload mocks to the selected review state', async () => {
    window.history.pushState({}, '', '/upload')

    render(<App />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /create blocked review and open review page/i,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toMatch(/^\/review\/mock-review-/)
    expect(window.location.search).toBe('')
    expect(
      screen.getByRole('heading', { level: 2, name: /issues/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /fix blockers before submitting/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /upload version 3/i }),
    ).toHaveAttribute(
      'href',
      '/upload?currentVersion=2&documentName=123-maple-appraisal-review.pdf&nextVersion=3',
    )
  })

  it('loads direct review routes from stored mock review ids', async () => {
    const { reviewId } = await mockUploadDocument({
      documentName: '123-maple-appraisal-review.pdf',
      variant: 'minorOnly',
      version: 3,
    })
    window.history.pushState({}, '', `/review/${reviewId}`)

    render(<App />)

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

  it('preserves upload version context when a review sends the user to upload', async () => {
    const { reviewId } = await mockUploadDocument({
      documentName: '123-maple-appraisal-review.pdf',
      variant: 'blocked',
      version: 2,
    })
    window.history.pushState({}, '', `/review/${reviewId}`)

    render(<App />)

    fireEvent.click(
      await screen.findByRole('link', { name: /upload version 3/i }),
    )

    expect(window.location.pathname).toBe('/upload')
    expect(window.location.search).toBe(
      '?currentVersion=2&documentName=123-maple-appraisal-review.pdf&nextVersion=3',
    )
    expect(
      screen.getByRole('heading', { level: 1, name: /upload document/i }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /create clean review and open review page/i,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toMatch(/^\/review\/mock-review-/)
    expect(window.location.search).toBe('')
    expect(screen.getByText('Version 3')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /ready to submit/i }),
    ).toBeInTheDocument()
  })
})
