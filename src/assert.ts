export function assert(
  value: unknown,
  message?: string | Error
): asserts value {
  if (!value) {
    if (!message) {
      throw new Error("assertion failed")
    }
    if (typeof message === "string") {
      throw new Error(message)
    }
    throw message
  }
}

