import { describe, expect, it } from 'vitest'
import { APIError } from '@/lib/api-client'

describe('APIError', () => {
  it('stores message and details', () => {
    const err = new APIError('fail', 400, 'bad request')
    expect(err.message).toBe('fail')
    expect(err.statusCode).toBe(400)
    expect(err.details).toBe('bad request')
    expect(err).toBeInstanceOf(Error)
  })
})
