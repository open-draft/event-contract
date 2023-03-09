import type { ZodType } from 'zod'

export type EventsMap = { [type: string]: unknown }

export type ContractListener<Data> = (data: Data) => void
export type ContractUnsubscribeFunction = () => void

export type ContractSchema<Events extends EventsMap> = {
  [K in keyof Events]: ZodType<Events[K]>
}

export interface ContractOptions<Events extends EventsMap = {}> {
  schema?: ContractSchema<Events>
  transport: {
    push<Type extends keyof Events & string>(
      type: Type,
      data: Events[Type]
    ): void

    subscribe<Type extends keyof Events & string>(
      type: Type,
      callback: ContractListener<Events[Type]>
    ): ContractUnsubscribeFunction
  }
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
    this.validateInput(type, data)
    this.options.transport.push(type, data)
  }

  /**
   * Subscribes to the given event type.
   * Returns an unsubscribe function that removes this particular listener.
   *
   * @example
   * contract.subscribe('greet', (name) => console.log(name))
   */
  public subscribe<Type extends keyof Events & string>(
    type: Type,
    listener: (data: Events[Type]) => void
  ): ContractUnsubscribeFunction {
    const unsubscribe = this.options.transport.subscribe(
      type,
      listener.bind(listener)
    )

    this.subscriptions.set(
      type,
      (this.subscriptions.get(type) || new Map()).set(listener, unsubscribe)
    )

    return () => this.unsubscribe(type, listener)
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

  private validateInput<Type extends keyof Events & string>(
    type: Type,
    data: Events[Type]
  ): void {
    if (this.options.schema == null) {
      return
    }

    const validate = this.options.schema[type]

    if (validate == null) {
      throw new Error(
        `Failed to push the "${type}" event: no schema has been defined for this event type`
      )
    }

    const parsedResult = validate.safeParse(data)
    if (parsedResult.success) {
      return
    }

    if (!parsedResult.success) {
      console.error(parsedResult.error.format())

      throw new TypeError(
        `Failed to push event "${type}": provided data violates the schema`,
        {
          cause: parsedResult.error,
        }
      )
    }
  }
}
