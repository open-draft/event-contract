import { ContractSchema, EventContract, EventsMap } from './EventContract'
import { eventTargetTransport } from './transports'

export type EventListener<Data> = (data: Data) => void

export class Emitter<Events extends EventsMap> {
  protected contract: EventContract<Events>

  constructor(schema: ContractSchema<Events>) {
    this.contract = new EventContract<Events>({
      transport: eventTargetTransport(),
      schema,
    })
  }

  public emit<Type extends keyof Events & string>(
    type: Type,
    data: Events[Type]
  ): this {
    this.contract.push(type, data)
    return this
  }

  public on<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ): this {
    this.contract.subscribe(type, listener)
    return this
  }

  public once<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ): this {
    const unsubscribe = this.contract.subscribe(type, (data) => {
      listener(data)
      unsubscribe()
    })

    return this
  }

  public off<Type extends keyof Events & string>(
    type: Type,
    listener: EventListener<Events[Type]>
  ): this {
    this.contract.unsubscribe(type, listener)
    return this
  }

  public removeAllListeners<Type extends keyof Events & string>(
    type?: Type
  ): this {
    this.contract.unsubscribe(type)
    return this
  }

  public eventNames(): Array<keyof Events> {
    const subscriptions = this.contract['subscriptions']
    return Array.from(subscriptions.keys()) as Array<keyof Events>
  }

  public listeners<Type extends keyof Events & string>(
    type: Type
  ): Array<EventListener<Events[Type]>> {
    const subscriptions = this.contract['subscriptions'].get(type)

    if (typeof subscriptions === 'undefined') {
      return []
    }

    return Array.from(subscriptions.values()) as Array<
      EventListener<Events[Type]>
    >
  }
}
