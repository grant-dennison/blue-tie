import { test } from "./define-test.browser"
import type { TestLib } from "./test-lib"

function strictEqual<T>(
  actual: unknown,
  expected: T,
  message?: string | Error
): asserts actual is T {
  if (actual !== expected) {
    if (!message) {
      throw new Error(
        `${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`
      )
    }
    if (typeof message === "string") {
      throw new Error(message)
    }
    throw message
  }
}

function deepStrictEqual<T>(
  actual: unknown,
  expected: T,
  message?: string | Error
): asserts actual is T {
  strictEqual(JSON.stringify(actual), JSON.stringify(expected), message)
}

const testLib: TestLib = {
  deepStrictEqual,
  strictEqual,
  test,
}

export default testLib
