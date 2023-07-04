const neverSymbol = Symbol("never")
export type DebugNever<Message extends string, T = unknown> = [
  never,
  T,
  Message,
  typeof neverSymbol
]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SomeFunction = (...args: readonly any[]) => unknown
export type WorkerInterface<T> = {
  [K in keyof T]: T[K] extends SomeFunction
    ? T[K]
    : DebugNever<"Field is not a function", [K, T[K]]>
}

export type DefinedWorker<T> = {
  /**
   * Instantiate a worker and provide access to remotely running logic.
   * @returns An object allowing transparent logic execution through a worker.
   */
  create: () => WorkerInterface<T>
}
