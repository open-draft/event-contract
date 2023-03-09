import { EventEmitter as NodeEventEmitter } from 'events'
import { EventsMap } from './EventContract'

export type EventListener<Data> = (data: Data) => void

export class EventEmitter<
  Events extends EventsMap = {}
> extends NodeEventEmitter {
  constructor() {
    super()
  }

  public eventNames() {
    return super.eventNames() as Array<keyof Events & string>
  }

  public on<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.on(type, listener)
  }

  public once<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.once(type, listener)
  }

  public addListener<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.addListener(type, listener)
  }

  public prependListener<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.prependListener(type, listener)
  }

  public prependOnceListener<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.prependOnceListener(type, listener)
  }

  public off<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.off(type, listener)
  }

  public removeListener<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ) {
    return super.removeListener(type, listener)
  }

  public removeAllListeners<Type extends keyof Events & string>(type?: Type) {
    return super.removeAllListeners(type)
  }

  public listeners<Type extends keyof Events & string>(type: Type) {
    return super.listeners(type) as Array<EventListener<Events[Type]>>
  }

  public rawListeners<Type extends keyof Events & string>(type: Type) {
    return super.rawListeners(type) as Array<EventListener<Events[Type]>>
  }

  public listenerCount<Type extends keyof Events & string>(type: Type) {
    return super.listenerCount(type)
  }
}
