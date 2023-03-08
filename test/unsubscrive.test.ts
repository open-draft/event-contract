import { EventContract, useEventTarget } from '../lib'

type Events = {
  greet: string
  add: number
}

it('unsubscribes from a single listener of the given event type', () => {
  const contract = new EventContract<Events>(useEventTarget())

  const firstGreetListener = vi.fn()
  const secondGreetListener = vi.fn()
  contract.subscribe('greet', firstGreetListener)
  contract.subscribe('greet', secondGreetListener)

  const addListener = vi.fn()
  contract.subscribe('add', addListener)

  // Only the unsubscribed listener is not called.
  contract.unsubscribe('greet', firstGreetListener)
  contract.push('greet', 'John')
  expect(firstGreetListener).not.toHaveBeenCalled()
  expect(secondGreetListener).toHaveBeenCalledTimes(1)
  expect(secondGreetListener).toHaveBeenCalledWith('John')

  // Irrelevant listeners are not affected.
  contract.push('add', 1)
  expect(addListener).toHaveBeenCalledTimes(1)
  expect(addListener).toHaveBeenCalledWith(1)
})

it('unsubscribes from all listeners of the given event type', () => {
  const contract = new EventContract<Events>(useEventTarget())

  const firstGreetListener = vi.fn()
  const secondGreetListener = vi.fn()
  contract.subscribe('greet', firstGreetListener)
  contract.subscribe('greet', secondGreetListener)

  const addListener = vi.fn()
  contract.subscribe('add', addListener)

  // All listeners are unsubscribed.
  contract.unsubscribe('greet')
  contract.push('greet', 'John')
  expect(firstGreetListener).not.toHaveBeenCalled()
  expect(secondGreetListener).not.toHaveBeenCalled()

  // Irrelevant listeners are not affected.
  contract.push('add', 1)
  expect(addListener).toHaveBeenCalledTimes(1)
  expect(addListener).toHaveBeenCalledWith(1)
})

it('unsubscribes from all events of all event types', () => {
  const contract = new EventContract<Events>(useEventTarget())

  const firstGreetListener = vi.fn()
  const secondGreetListener = vi.fn()
  contract.subscribe('greet', firstGreetListener)
  contract.subscribe('greet', secondGreetListener)

  const addListener = vi.fn()
  contract.subscribe('add', addListener)

  // All listeners are unsubscribed.
  contract.unsubscribe()
  contract.push('greet', 'John')
  expect(firstGreetListener).not.toHaveBeenCalled()
  expect(secondGreetListener).not.toHaveBeenCalled()

  contract.push('add', 1)
  expect(addListener).not.toHaveBeenCalled()
})

it('unsubscribes from the listener using the function returned from it', () => {
  const contract = new EventContract<Events>(useEventTarget())

  const firstGreetListener = vi.fn()
  const secondGreetListener = vi.fn()
  const unsubscribe = contract.subscribe('greet', firstGreetListener)
  const secondUnsubscribe = contract.subscribe('greet', secondGreetListener)

  unsubscribe()

  contract.push('greet', 'John')
  expect(firstGreetListener).not.toHaveBeenCalled()
  expect(secondGreetListener).toHaveBeenCalledTimes(1)
  expect(secondGreetListener).toHaveBeenCalledWith('John')

  secondUnsubscribe()
  firstGreetListener.mockReset()
  secondGreetListener.mockReset()

  contract.push('greet', 'John')
  expect(firstGreetListener).not.toHaveBeenCalled()
  expect(secondGreetListener).not.toHaveBeenCalled()
})
