export type EventsMap = { [type: string]: unknown }

export type ContractListener<Data> = (data: Data) => void
export type ContractUnsubscribeFunction = () => void

export interface ContractOptions<Events extends EventsMap = {}> {
  push<Type extends keyof Events & string>(type: Type, data: Events[Type]): void

  subscribe<Type extends keyof Events & string>(
    type: Type,
    callback: ContractListener<Events[Type]>
  ): ContractUnsubscribeFunction
}

export class EventContract<Events extends EventsMap = {}> {
  protected subscriptions: Map<keyof Events, Map<Function, Function>>

  constructor(protected readonly options: ContractOptions<Events>) {
    this.subscriptions = new Map()
  }

  /**
   * Emits an event of the given type with the given data.
   *
   * @example
   * contract.push('greet', 'John')
   */
  public push<Type extends keyof Events & string>(
    type: Type,
    data: Events[Type]
  ): void {
    this.options.push(type, data)
  }

  /**
   * Subscribes to the given event type.
   *
   * @example
   * contract.subscribe('greet', (name) => console.log(name))
   */
  public subscribe<Type extends keyof Events & string>(
    type: Type,
    listener: (data: Events[Type]) => void
  ): void {
    const unsubscribe = this.options.subscribe(type, listener.bind(listener))

    this.subscriptions.set(
      type,
      (this.subscriptions.get(type) || new Map()).set(listener, unsubscribe)
    )
  }

  /**
   * Removes subscriptions from this contract.
   * When called without any arguments, all subscriptions are removed.
   * When called only with the event type, all subscriptions of that type are removed.
   * When called with the event type and a specific listener, only that listener is removed.
   *
   * @example
   * contract.unsubscribe()
   * contract.unsubscribe('greet')
   * contract.unsubscribe('greet', listener)
   */
  public unsubscribe<Type extends keyof Events>(
    type?: Type,
    listener?: ContractListener<Events[Type]>
  ): void {
    // Calling this method without any arguments removes
    // all subscriptions from this contract.
    if (typeof type === 'undefined') {
      for (const [_, subscriptions] of this.subscriptions) {
        subscriptions.forEach((unsubscribe) => unsubscribe())
      }
      return
    }

    // If no subscriptions have been added for this type,
    // ignore this "unsubscribe" call.
    const typeSubscriptions = this.subscriptions.get(type)
    if (typeof typeSubscriptions === 'undefined') {
      return
    }

    // If no specific listener has been provided to this "unsubscribe" call,
    // get all the listeners and dispatch their unsubscribe functions.
    if (typeof listener === 'undefined') {
      typeSubscriptions.forEach((unsubscribe) => unsubscribe())
      this.subscriptions.delete(type)
      return
    }

    // If a specific listener has been provided, then only unsubscribe
    // from that particular listener.
    const unsubscribe = typeSubscriptions.get(listener)

    if (typeof unsubscribe !== 'undefined') {
      unsubscribe()
    }

    typeSubscriptions.delete(listener)
  }
}
