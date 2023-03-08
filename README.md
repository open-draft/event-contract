# Event Contract

Type-safe, implementation-agnostic event contract framework.

## What is this for?

This is a tiny framework for type-safe event-based systems in TypeScript. It's built on the struggle that none of the event-based APIs in TypeScript are strict. Here's an example of a problem:

```ts
const target = new EventTarget()

target.addEventListener('greet', handler)
target.dispatchEvent(new CustomEvent('gret')) // Oops, a typo!
```

TypeScript will not warn or throw despite us making an obvious mistake above. The standard `EventTarget` API doesn't accept an events map generic either, leaving us no choice to make it more strict by normal means.

I am convinced that event-based system must be as strict as possible. You don't want to dispatch events you don't expect to handle. The data transferred in those events must be clearly defined. Type-safety must be achieved on build-time with TypeScript. This is precisely what this framework does.

## Getting started

### Install

```sh
npm install event-contract
```

### Transports

This framework operates on the concept of _transports_. Transports describe how to handle events and create subscriptions. Absolutely anything can be a transport: from the standard APIs like `EventTarget` and `MessageChannel`, to custom logic like communication with your database or a third-party service.

In this example, we will implement a custom transport over `EventTarget`. Each transport is described using two methods:

- `push()` describes what to do when a new event is emitter;
- `subscribe()` describes how to handle new subscriptions.

In the context of `EventTarget`, we handle `push()` by `target.dispatchEvent()`, and we handle `subscribe()` by `target.addEventListener()`. Here's the final transport implementation:

```ts
const target = new EventTarget()

new EventContract({
  push(type, data) {
    // Translate pushing a new event to dispatching
    // a "MessageEvent" on this event target.
    target.dispatchEvent(new MessageEvent(type, { data }))
  },
  subscribe(type, next) {
    const handler = (event: Event) => {
      if (event instanceof MessageEvent) {
        next(event.data)
      }
    }

    // Add a new listener when a subscription occurs.
    target.addEventListener(type, handler)

    return () => {
      // Unsubscribe from this by removing the listener.
      target.removeEventListener(type, handler)
    }
  },
})
```

> The `EventTarget` API is a great choice because it's present in both browser and Node.js, meaning that we can now use that contract in those environments.

Note that this is an example implementation. This framework exports a set of [Default transfers](#default-transfers) that you should use for event contracts over standard JavaScript API.

## Default transfers

This framework comes with a list of default transfers that implement event contract using various built-in APIs.

- `useEventTarget()`
- `useBroadcastChannel()`

Each built-in transport is a function that returns the event contract options. Provide those options to the `EventContract` constructor to use that transport.

```ts
import { EventContract, useEventTarget } from 'event-contract'

const contract = new EventContract<{ greet: string }>(useEventTarget())
```

## API

### `EventContract`

```ts
type Events = {
  greet: string
}

const contract = new EventContract<Events>({
  push(type, data) {
    // Describe how events should be emitted.
  },
  subscribe(type, next) {
    // Attach a listener when a subscription occurs.

    return () => {
      // Describe how to unsubscribe from this subscription.
    }
  },
})
```

### `EventContract.subscribe()`

```ts
contract.subscribe('greet', (name) => {
  console.log(`hello, ${name}`)
})
```

### `EventContract.push()`

```ts
contract.push('greet', 'John')
```

### `EventContract.unsubscribe()`

Unsubscribes from the established subscriptions.

When called without any arguments, the `.unsubscribe()` method removes _all_ active subscriptions for all event types. This is useful for freeing memory when you no longer need this contract.

```ts
contract.unsubscribe()
```

If you provide an event type, all the subscriptions of that event type will be removed.

```ts
contract.unsubscribe('greet')
```

You can also provide both the event type and a specific listener function. In that case, only that given listener will be removed.

```ts
contract.unsubscribe('greet', listener)
```

> Note that every subscription also returns a function that you can use the unsubscribe the respective listener directly:

```ts
const unsubscribe = contract.subscribe('greet', listener)
unsubscribe()
```

## Recipes

### Handling an event once

You may have noticed that there isn't something like a `.subscribeOnce()` on the contract. Instead, in order to handle a certain event once, you have to unsubscribe that handler explicitly:

```ts
contract.subscribe('greet', (name) => {
  // Unsubscribe from this handler.
  // Note that all subscriptions are bound to themselves,
  // allowing you to reference them as "this".
  contract.unsubscribe('greet', this)
})
```

Alternatively, you can use the unsubscribe function returned from every subscription to achieve the same result:

```ts
const unsubscribe = contract.subscribe('greet', (name) => {
  unsubscribe()
})
```
