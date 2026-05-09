import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createReviewMock } from './data/reviewMock'
import ReviewPage from './ReviewPage'

describe('ReviewPage', () => {
  it('renders review metadata and the uploaded document viewer', () => {
    const review = createReviewMock()

    render(<ReviewPage review={review} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /123-maple-appraisal-review\.pdf/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Version 2')).toBeInTheDocument()
    expect(screen.getByText('on review')).toBeInTheDocument()
    expect(
      screen.getByTitle(/123-maple-appraisal-review\.pdf pdf/i),
    ).toHaveAttribute('src', '/local-sample-uploaded-document.pdf')
    expect(
      screen.getByRole('link', { name: /open document in new tab/i }),
    ).toHaveAttribute('href', '/local-sample-uploaded-document.pdf')
  })
})
