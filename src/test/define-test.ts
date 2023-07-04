import { isNode } from "environment"
import { test as browserTest } from "./define-test.browser"
import { test as nodeTest } from "./define-test.node"

export function test(description: string, implementation: () => void | PromiseLike<void>) {
  if (isNode) {
    nodeTest(description, implementation)
  } else {
    browserTest(description, implementation)
  }
}
