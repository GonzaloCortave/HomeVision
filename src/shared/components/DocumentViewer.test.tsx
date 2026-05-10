import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import DocumentViewer from './DocumentViewer'

afterEach(() => {
  cleanup()
})

describe('DocumentViewer', () => {
  it('renders the document URL in the embedded PDF viewer', () => {
    render(<DocumentViewer documentUrl="/local-sample-uploaded-document.pdf" />)

    expect(screen.getByTitle('Document preview')).toHaveAttribute(
      'src',
      '/local-sample-uploaded-document.pdf',
    )
  })

  it('renders a visible fallback link that opens the document in a new tab', () => {
    render(<DocumentViewer documentUrl="/local-sample-uploaded-document.pdf" />)

    const link = screen.getByRole('link', {
      name: /open document in new tab/i,
    })

    expect(link).toBeVisible()
    expect(link).toHaveAttribute('href', '/local-sample-uploaded-document.pdf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('uses an accessible iframe title', () => {
    render(
      <DocumentViewer
        documentUrl="/inspection.pdf"
        title="Inspection report preview"
      />,
    )

    expect(screen.getByTitle('Inspection report preview')).toBeInTheDocument()
  })

  it('can render its title as a lower-level heading inside a parent section', () => {
    render(
      <DocumentViewer
        documentUrl="/inspection.pdf"
        title="Inspection report preview"
        titleHeadingLevel="h3"
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /inspection report preview/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders a useful missing-document state when the URL is null', () => {
    render(<DocumentViewer documentUrl={null} />)

    expect(
      screen.getByRole('heading', { name: /document unavailable/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/cannot be previewed because its url is missing/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /open document in new tab/i }),
    ).not.toBeInTheDocument()
  })

  it('allows feature-specific missing-document copy', () => {
    render(
      <DocumentViewer
        documentUrl={null}
        missingDocumentDescription="Upload a corrected packet before previewing this review."
        missingDocumentTitle="Review document missing"
      />,
    )

    expect(
      screen.getByRole('heading', { name: /review document missing/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/upload a corrected packet before previewing/i),
    ).toBeInTheDocument()
  })

  it('renders the missing-document state when the URL is blank', () => {
    render(<DocumentViewer documentUrl="   " />)

    expect(
      screen.getByRole('heading', { name: /document unavailable/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTitle('Document preview')).not.toBeInTheDocument()
  })
})
