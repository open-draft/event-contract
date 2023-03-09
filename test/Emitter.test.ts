import { z } from 'zod'
import { Emitter } from '../lib'

it('validates emitted events against the schema', () => {
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
