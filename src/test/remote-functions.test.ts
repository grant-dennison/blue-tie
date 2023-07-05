import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"
import assert from "assert"
import { assertRejects } from "./common/custom-assert"

const { strictEqual, test } = testLib

const remoteFunctionsWorker = defineWorker(
  "remote-functions-worker",
  isNode ? __filename : getBrowserScript(),
  {
    getStatefulFunc: async () => {
      let state = 0
      return async () => {
        state++
        return state
      }
    }
  }
)

test("remote state", async () => {
  const worker1 = remoteFunctionsWorker.create()
  const worker2 = remoteFunctionsWorker.create()

  const f1a = await worker1.getStatefulFunc()
  const f1b = await worker1.getStatefulFunc()
  const f2 = await worker2.getStatefulFunc()
  
  await f1a()
  await f1a()
  await f1b()
  await f1a()
  await f2()
  await f1b()

  const f1aFinal = await f1a()
  const f1bFinal = await f1b()
  const f2Final = await f2()

  strictEqual(f1aFinal, 4)
  strictEqual(f1bFinal, 3)
  strictEqual(f2Final, 2)

  await remoteFunctionsWorker.close(worker1)
  await remoteFunctionsWorker.close(worker2)
})

test("free remote function", async () => {
  await remoteFunctionsWorker.withInstance(async (worker) => {
    const f = await worker.getStatefulFunc()
    await f()
    const check1 = await f()
    strictEqual(check1, 2)
    await remoteFunctionsWorker.free(worker, f)
    await assertRejects(() => f(), "Function should no longer function after freeing")
  })
})

test("double-free remote function", async () => {
  await remoteFunctionsWorker.withInstance(async (worker) => {
    const f = await worker.getStatefulFunc()
    await f()
    const check1 = await f()
    strictEqual(check1, 2)
    await remoteFunctionsWorker.free(worker, f)
    await assertRejects(() => remoteFunctionsWorker.free(worker, f), "Function cannot be freed a second time")
  })
})

test("free arbitrary function", async () => {
  const arbitrary = async () => {}

  await remoteFunctionsWorker.withInstance(async (worker) => {
    await assertRejects(() => remoteFunctionsWorker.free(worker, arbitrary), "Arbitrary function cannot be freed")
  })
})
