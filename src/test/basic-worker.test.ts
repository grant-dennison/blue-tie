import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { strictEqual, test } = testLib

const basicWorker = defineWorker(
  "basic worker",
  isNode ? __filename : getBrowserScript(),
  {
    greet: async (input: string) => {
      return `hi ${input}`
    },
  }
)

test("basic worker", async () => {
  const workerApi = basicWorker.create()
  const result = await workerApi.greet("mom")
  strictEqual(result, "hi mom")
})
