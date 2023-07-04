import { strictEqual, test } from "test-basics"
import basicWorker from "./basic-worker"

test("basic worker", async () => {
  const workerApi = basicWorker.create()
  const result = await workerApi.greet('mom')
  strictEqual(result, "hi mom")
})
