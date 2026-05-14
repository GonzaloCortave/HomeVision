import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the default review page smoke path', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByTitle('123-maple-appraisal-review.pdf'),
    ).toBeInTheDocument()
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
})
