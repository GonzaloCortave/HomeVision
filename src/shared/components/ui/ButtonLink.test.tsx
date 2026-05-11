import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ButtonLink from './ButtonLink'

afterEach(() => {
  cleanup()
})

describe('ButtonLink', () => {
  it('renders an anchor with the shared secondary button treatment', () => {
    render(<ButtonLink href="#issues-panel">View issues</ButtonLink>)

    const link = screen.getByRole('link', { name: /view issues/i })

    expect(link).toHaveAttribute('href', '#issues-panel')
    expect(link).toHaveClass('border-slate-300')
    expect(link).toHaveClass('text-sky-700')
    expect(link).toHaveClass('text-center')
  })

  it('supports shared sizing without feature-specific padding overrides', () => {
    render(
      <ButtonLink href="#document-panel" size="sm">
        Document
      </ButtonLink>,
    )

    const link = screen.getByRole('link', { name: /document/i })

    expect(link).toHaveClass('px-3')
    expect(link).toHaveClass('py-2')
  })
})
