import assert from "node:assert"
import { test } from "under-the-sun"
import basicWorker from "./basic-worker"

test("basic worker", async () => {
  const workerApi = basicWorker.create()
  const result = await workerApi.greet('mom')
  assert.strictEqual(result, "hi mom")
})
