import { describe, expect, it } from 'vitest'
import { loadReview } from './reviewClient'

describe('reviewClient', () => {
  it('loads a normalized default review asynchronously', async () => {
    await expect(loadReview()).resolves.toMatchObject({
      name: '123-maple-appraisal-review.pdf',
      status: 'on_review',
      document: {
        url: '/local-sample-uploaded-document.pdf',
      },
    })
  })

  it('returns a fresh normalized review object on each load', async () => {
    const firstReview = await loadReview({ variant: 'minorOnly' })
    const secondReview = await loadReview({ variant: 'minorOnly' })

    expect(firstReview).toEqual(secondReview)
    expect(firstReview).not.toBe(secondReview)
    expect(firstReview.issues).not.toBe(secondReview.issues)
    expect(firstReview.document).not.toBe(secondReview.document)
  })

  it('normalizes the missing-document variant to an explicit null URL', async () => {
    await expect(
      loadReview({ variant: 'missingDocument' }),
    ).resolves.toMatchObject({
      document: {
        url: null,
      },
    })
  })

  it('can reject to support review page error states', async () => {
    await expect(loadReview({ shouldReject: true })).rejects.toThrow(
      'Unable to load review data.',
    )
  })
})
