import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import TextLink from './TextLink'

afterEach(() => {
  cleanup()
})

describe('TextLink', () => {
  it('renders a semantic text link with the shared link treatment', () => {
    render(
      <TextLink className="text-sm" href="/local-sample-uploaded-document.pdf">
        Open document
      </TextLink>,
    )

    const link = screen.getByRole('link', { name: /open document/i })

    expect(link).toHaveAttribute('href', '/local-sample-uploaded-document.pdf')
    expect(link).toHaveClass('font-medium')
    expect(link).toHaveClass('underline-offset-4')
    expect(link).toHaveClass('text-sm')
  })
})
