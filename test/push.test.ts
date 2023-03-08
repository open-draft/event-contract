import { EventContract, useEventTarget } from '..'

type Events = {
  greet: string
  add: number
}

it('dispatches relevant event listeners', () => {
  const contract = new EventContract<Events>(useEventTarget())

  const firstGreetListener = vi.fn()
  const secondGreetListener = vi.fn()
  const addListener = vi.fn()
  contract.subscribe('greet', firstGreetListener)
  contract.subscribe('greet', secondGreetListener)
  contract.subscribe('add', addListener)
  contract.push('greet', 'John')

  expect(firstGreetListener).toHaveBeenCalledTimes(1)
  expect(firstGreetListener).toHaveBeenCalledWith('John')

  expect(secondGreetListener).toHaveBeenCalledTimes(1)
  expect(secondGreetListener).toHaveBeenCalledWith('John')

  expect(addListener).not.toHaveBeenCalled()
})
