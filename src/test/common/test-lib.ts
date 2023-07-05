export type TestLib = {
  readonly deepStrictEqual: (
    actual: unknown,
    expected: unknown,
    message?: string | Error
  ) => void
  readonly strictEqual: (
    actual: unknown,
    expected: unknown,
    message?: string | Error
  ) => void
  readonly test: (
    description: string,
    implementation: () => void | PromiseLike<void>
  ) => void
}
