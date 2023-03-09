import { z } from 'zod'
import { EventContract, useEventTarget } from '../lib'

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => void 0)
})

afterAll(() => {
  vi.restoreAllMocks()
})

it('validates pushed data against the schema', () => {
  const contract = new EventContract({
    ...useEventTarget(),
    schema: {
      greet: z.string(),
    },
  })

  const greetListener = vi.fn()
  contract.subscribe('greet', greetListener)

  // Data satisfying the schema is pushed okay.
  contract.push('greet', 'John')
  expect(greetListener).toHaveBeenCalledTimes(1)
  expect(greetListener).toHaveBeenCalledWith('John')

  greetListener.mockReset()

  // Data violating the schema throws.
  expect(() => contract.push('greet', 123 as any)).toThrow(
    `Failed to push event "greet": provided data violates the schema`
  )
  expect(greetListener).not.toHaveBeenCalled()
})

it('validates nested data structures', () => {
  const contract = new EventContract({
    ...useEventTarget(),
    schema: {
      greet: z.object({
        name: z.string(),
      }),
    },
  })

  const greetListener = vi.fn()
  contract.subscribe('greet', greetListener)

  // Data satisfying the schema is pushed okay.
  contract.push('greet', { name: 'John' })
  expect(greetListener).toHaveBeenCalledTimes(1)
  expect(greetListener).toHaveBeenCalledWith({ name: 'John' })

  greetListener.mockReset()

  // Data violating the schema throws.
  expect(() => contract.push('greet', { name: 123 } as any)).toThrow(
    `Failed to push event "greet": provided data violates the schema`
  )
  expect(greetListener).not.toHaveBeenCalled()
})
