import testLib from "test-lib"
import basicWorker from "./basic-worker"

const { strictEqual, test } = testLib

test("basic worker", async () => {
  const workerApi = basicWorker.create()
  const result = await workerApi.greet("mom")
  strictEqual(result, "hi mom")
})
