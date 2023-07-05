import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { strictEqual, test } = testLib

const workerDiagnosticsWorker = defineWorker(
  "worker-diagnostics-worker",
  isNode ? __filename : getBrowserScript(),
  {
    boo: async () => {},
    getFunc: async () => async () => {}
  }
)

test("worker diagnostics", async () => {
  const worker1 = workerDiagnosticsWorker.create()
  const diagnostics1 = await workerDiagnosticsWorker.close(worker1)
  strictEqual(diagnostics1.dynamicRefCount, 0)

  const worker2 = workerDiagnosticsWorker.create()
  await worker2.boo()
  await worker2.boo()
  const diagnostics2 = await workerDiagnosticsWorker.close(worker2)
  strictEqual(diagnostics2.dynamicRefCount, 0)

  strictEqual(diagnostics2.callCount - diagnostics1.callCount, 2)
})

test("worker diagnostics dynamicRefCount", async () => {
  const worker = workerDiagnosticsWorker.create()

  const f1 = await worker.getFunc()
  const f2 = await worker.getFunc()
  void f2
  const f3 = await worker.getFunc()
  await f3()

  workerDiagnosticsWorker.free(worker, f1)
  workerDiagnosticsWorker.free(worker, f3)

  const diagnostics = await workerDiagnosticsWorker.close(worker)
  strictEqual(diagnostics.dynamicRefCount, 1)
})
