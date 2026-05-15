import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Button from './Button'

afterEach(() => {
  cleanup()
})

describe('Button', () => {
  it('defaults to a non-submit primary button', () => {
    render(<Button>Retry</Button>)

    const button = screen.getByRole('button', { name: /retry/i })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('bg-indigo-600')
  })

  it('supports compact text actions', () => {
    render(<Button variant="text">Show more</Button>)

    const button = screen.getByRole('button', { name: /show more/i })

    expect(button).toHaveClass('text-xs')
    expect(button).toHaveClass('text-indigo-700')
  })
})
