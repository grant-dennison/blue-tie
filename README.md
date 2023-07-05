# Blue Tie

Blue Tie creates simple typed abstractions over JavaScript Worker threads,
compatible with both Node.js and browser applications.

## Installation

```
npm install --save blue-tie
```

## Usage

Define a worker:

```ts
// fibonacci-worker.ts
import { defineWorker, getBrowserScript, isNode } from "blue-tie"

export const fibonacciWorker = defineWorker(
  "fibonacci-worker",
  isNode ? __filename : getBrowserScript(),
  {
    fibonacci: async (n: number) => {
      return doFibonacci(n)
    },
  }
)

// This is an intentionally naive Fibonacci implementation.
function doFibonacci(n: number): number {
  if (n < 1) {
    return 0
  }
  if (n === 1) {
    return 1
  }
  return doFibonacci(n - 1) + doFibonacci(n - 2)
}
```

Create and use the worker:

```ts
// main.ts
import { isMainThread } from "blue-tie"
import { fibonacciWorker } from "./fibonacci-worker.ts"

// Guard against running this code in worker threads.
// Note: This guard is not necessary in every setup.
if (isMainThread) {
  // Instantiate a worker.
  const worker = fibonacciWorker.create()

  // Call functions in the worker.
  const result = await worker.fibonacci(19)
  console.log(`Fibonacci with n 19 is ${result}`)

  // Clean up when you're done.
  await fibonacciWorker.close(worker)
}
```

## Examples

Some fully functional examples are available in the [examples/ directory](examples/).

## Implementation Notes

### Passing Values

It should be noted that all values transferred between worker and main thread
are **copied by value**.
This library attempts to hide that and make everything feel
like native shared-memory multithreaded programming,
but it is merely made to look that way.

As such, be careful not to assume that pointers are equivalent,
and be aware that passing functions may not behave entirely as expected.

### Worker File Name

The second parameter (`fileName`) of the `defineWorker()` function
is important to get right.

For Node.js, this value should almost always be `__filename`.
This values makes the library load the Worker using the literal same script
containing the worker definition, which is exactly what needs to be run.
In the event that the application is bundled, this value could instead
be a literal pointing to a separate bundle created specifically for the worker(s).

For the browser, this value may be set to `getBrowserScript()` (exported from this library)
if the worker script is going to be the exact same script as the parent application.
Typically, such a setup would require gating the main startup logic behind
some `if (isMainThread) ...` construct.
Alternatively, this value could point to a separate bundle created specifically for the worker(s).

### Bundling

This library necessitates using a bundler to function in the browser.
There are two completely separate implementations of the code
specific to the APIs available in Node.js and the browser.
Bundlers like esbuild will respect the package definition
and pick the appropriate implementation for the bundle.

### Stateful Workers

The primary examples for this library demonstrate farming out pure functions
to background worker threads.
However, this library does enable preserving state by returning functions
from the worker.

```ts
// remote-function-worker.ts
import { defineWorker, getBrowserScript, isNode } from "blue-tie"

const { strictEqual, test } = testLib

const remoteFunctionWorker = defineWorker(
  "remote-functions-worker",
  isNode ? __filename : getBrowserScript(),
  {
    getStatefulFunc: async () => {
      let state = 0
      return async () => {
        state++
        return state
      }
    },
  }
)
```

The function returned from the worker will be proxied,
so that it may be called as if directly.

```ts
// main.ts
import { remoteFunctionWorker } from "remote-function-worker"

await remoteFunctionWorker.withInstance(async (worker) => {
  const f = await worker.getStatefulFunc()
  await f() // 1
  await f() // 2
  await f() // 3
})
```

If using a long-lived worker with lots of stateful functions,
function references should be freed to avoid memory leaks.
(They will be cleaned up automatically when the worker is closed.)

```ts
// main.ts
import { remoteFunctionWorker } from "remote-function-worker"

const worker = remoteFunctionWorker.create()
const f1 = await worker.getStatefulFunc()
const f2 = await worker.getStatefulFunc()
await f1() // 1
await f1() // 2
await f2() // 1
await f2() // 2
await remoteFunctionWorker.free(worker, f1)
await remoteFunctionWorker.free(worker, f2)
```
