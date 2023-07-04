const assert = require("assert")
const { test } = require("under-the-sun")
const { fibonacciWorker } = require("./fibonacci-worker")

test("fibonacci > 19", async () => {
  const worker = fibonacciWorker.create()
  const result = await worker.fibonacci(19)
  assert.strictEqual(result, 4181)
})
