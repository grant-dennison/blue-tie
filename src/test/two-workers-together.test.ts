import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { strictEqual, test } = testLib

const worker1 = defineWorker(
  "worker1",
  isNode ? __filename : getBrowserScript(),
  {
    greet1: async (input: string) => {
      return `hi ${input}`
    },
  }
)

const worker2 = defineWorker(
  "worker2",
  isNode ? __filename : getBrowserScript(),
  {
    greet2: async (input: string) => {
      return `hey ${input}`
    },
  }
)

test("two workers in same file", async () => {
  const worker1Api = worker1.create()
  const worker2Api = worker2.create()
  const result1 = await worker1Api.greet1("mom")
  strictEqual(result1, "hi mom")
  const result2 = await worker2Api.greet2("mom")
  strictEqual(result2, "hey mom")
})
