import assert from "assert"
import { test } from "under-the-sun"
import { fibonacciWorker } from "./fibonacci-worker"

test("fibonacci > 19", async () => {
  const worker = fibonacciWorker.create()
  const result = await worker.fibonacci(19)
  assert.strictEqual(result, 4181)
})
