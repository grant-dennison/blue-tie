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

test("basic worker (with)", async () => {
  let bodyCalled = false
  await basicWorker.withInstance(async (workerApi) => {
    const result = await workerApi.greet("mom")
    strictEqual(result, "hi mom")
    bodyCalled = true
  })
  strictEqual(bodyCalled, true)
})

test("basic worker (stateful)", async () => {
  const workerApi = basicWorker.create()
  try {
    const result = await workerApi.greet("mom")
    strictEqual(result, "hi mom")
  } finally {
    await basicWorker.close(workerApi)
  }
})
