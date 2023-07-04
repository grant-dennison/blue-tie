import { test as utsTest } from "under-the-sun"

export function test(
  description: string,
  implementation: () => void | PromiseLike<void>
) {
  utsTest(description, implementation)
}
