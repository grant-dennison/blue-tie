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
export type OnlyFunctions<T> = {
  [K in keyof T]: T[K] extends SomeFunction
    ? EnsureAsyncIfFunction<T[K], T[K]>
    : DebugNever<"Field is not a function", [K, T[K]]>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureAsyncIfFunction<Evaluate, Return> = (Evaluate extends (...args: infer P) => (infer R) ? (R extends PromiseLike<infer R2> ? EnsureAsyncIfFunction<R2, Return> : DebugNever<"Function must be async (return Promise)", Evaluate>) : Return)
// export type EnsureAsyncIfFunction0<T> = (T extends (...args: infer P) => (infer R) ? (R extends PromiseLike<infer R2> ? (...args: P) => PromiseLike<EnsureAsyncIfFunction0<R2>> : (...args: P) => PromiseLike<EnsureAsyncIfFunction0<R>>) : T)

export type WorkerInterface<T> = OnlyFunctions<T>

export type DefinedWorker<T> = {
  /**
   * Instantiate a worker and provide access to remotely running logic.
   * @returns An object allowing transparent logic execution through a worker.
   */
  create: () => WorkerInterface<T>
  close: (worker: WorkerInterface<T>) => PromiseLike<WorkerDiagnostics>
  getDiagnostics: () => PromiseLike<OverallDiagnostics>
  free: (worker: WorkerInterface<T>, thing: unknown) => PromiseLike<void>
  withInstance: (useInstance: (worker: WorkerInterface<T>) => PromiseLike<void>) => PromiseLike<WorkerDiagnostics>
}
