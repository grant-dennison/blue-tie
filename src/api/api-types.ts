import type { WorkerDiagnostics, OverallDiagnostics } from "./diagnostics"

const neverSymbol = Symbol("never")
export type DebugNever<Message extends string, T = unknown> = [
  never,
  T,
  Message,
  typeof neverSymbol
]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SomeFunction = (...args: readonly any[]) => unknown
export type SomeAsyncFunction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: readonly any[]
) => PromiseLike<unknown>
export type OnlyFunctions<T> = {
  [K in keyof T]: T[K] extends SomeFunction
    ? EnsureAsyncIfFunction<T[K], T[K]>
    : DebugNever<"Field is not a function", [K, T[K]]>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureAsyncIfFunction<Evaluate, Return> = Evaluate extends (
  ...args: infer P
) => infer R
  ? R extends PromiseLike<infer R2>
    ? EnsureAsyncIfFunction<R2, Return>
    : DebugNever<"Function must be async (return Promise)", Evaluate>
  : Return

export type WorkerInterface<T> = OnlyFunctions<T>

export type DefinedWorker<T> = {
  /**
   * Instantiate a worker and provide access to remotely running logic.
   * @returns An object allowing transparent logic execution through a worker.
   */
  create: () => WorkerInterface<T>
  /**
   * Destroy/clean up a worker started with `create()`.
   * @param worker Instance returned from `create()`.
   * @returns Diagnostics about worker.
   */
  close: (worker: WorkerInterface<T>) => PromiseLike<WorkerDiagnostics>
  getDiagnostics: () => PromiseLike<OverallDiagnostics>
  /**
   * Explicitly free a resource returned from a worker method.
   * At present, this is only applicable for returned functions.
   * @param worker Instance returned from `create()` or provided from `withInstance()`.
   * @param thing Reference to free.
   */
  free: (worker: WorkerInterface<T>, thing: unknown) => PromiseLike<void>
  /**
   * Obtain a temporary worker instance.
   * This method is equivalent to `create()` with a try/finally `close()`
   * and is merely a convenience to avoid forgetting to close the worker.
   * @param useInstance What to do with the worker while available.
   * @returns Diagnostics about worker after closed.
   */
  withInstance: (
    useInstance: (worker: WorkerInterface<T>) => PromiseLike<void>
  ) => PromiseLike<WorkerDiagnostics>
}
