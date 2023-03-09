import { ContractOptions, EventsMap } from './EventContract'

export const eventTargetTransport = <
  Events extends EventsMap = {}
>(): ContractOptions<Events>['transport'] => {
  const target = new EventTarget()

  return {
    push(type, data) {
      target.dispatchEvent(new MessageEvent(type, { data }))
    },
    subscribe(type, next) {
      const handler = (event: Event) => {
        if (event instanceof MessageEvent) {
          next(event.data)
        }
      }
      target.addEventListener(type, handler)
      return () => target.removeEventListener(type, handler)
    },
  }
}

export function broadcastChannelTransport<Events extends EventsMap = {}>(
  name: string
): ContractOptions<Events>['transport'] {
  const channel = new BroadcastChannel(name)

  return {
    push(type, data) {
      channel.postMessage({ type, data })
    },
    subscribe(type, next) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === type) {
          next(event.data.data)
        }
      }
      channel.addEventListener('message', handler)

      return () => {
        channel.removeEventListener('message', handler)
      }
    },
  }
}
