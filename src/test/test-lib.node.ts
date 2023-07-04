import { deepStrictEqual, strictEqual } from "node:assert"
import { test } from "./define-test.node"
import type { TestLib } from "./test-lib"

const testLib: TestLib = {
  deepStrictEqual,
  strictEqual,
  test,
}

export default testLib
