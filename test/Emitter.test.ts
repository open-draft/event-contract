import { z } from 'zod'
import { Emitter } from '../lib'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('eventNames()', () => {
  it('returns a single known event name', () => {
    const emitter = new Emitter({ greet: z.string() })
    emitter.on('greet', vi.fn())

    expect(emitter.eventNames()).toEqual(['greet'])
  })

  it('returns all registered event names', () => {
    const emitter = new Emitter({
      greet: z.string(),
      bye: z.string(),
    })
    emitter.on('greet', vi.fn())
    emitter.on('bye', vi.fn())

    expect(emitter.eventNames()).toEqual(['greet', 'bye'])
  })

  it('returns an empty array given no registered event names', () => {
    const emitter = new Emitter({})
    expect(emitter.eventNames()).toEqual([])
  })
})

it('validates emitted events against the schema', () => {
  vi.spyOn(console, 'error').mockImplementation(() => void 0)

  const emitter = new Emitter({
    greet: z.object({
      name: z.string(),
    }),
  })

  const greetListener = vi.fn()
  emitter.on('greet', greetListener)

  emitter.emit('greet', { name: 'John' })
  expect(greetListener).toHaveBeenCalledWith({ name: 'John' })

  greetListener.mockReset()

  expect(() => emitter.emit('greet', 'broken' as any)).toThrow(
    `Failed to push event "greet": provided data violates the schema`
  )
  expect(greetListener).not.toHaveBeenCalled()
})
