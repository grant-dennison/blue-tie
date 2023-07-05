import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"
import { deepStrictEqual } from "assert"

const { strictEqual, test } = testLib

const overallDiagnosticsWorker = defineWorker(
  "overall-diagnostics-worker",
  isNode ? __filename : getBrowserScript(),
  {
    boo: async () => {},
  }
)

test("overall diagnostics", async () => {
  const initialDiagnostics = await overallDiagnosticsWorker.getDiagnostics()
  deepStrictEqual(initialDiagnostics, {
    workersCreatedCount: 0,
    workersDiagnostics: [],
  })

  const worker1 = overallDiagnosticsWorker.create()
  const worker2 = overallDiagnosticsWorker.create()
  const worker3 = overallDiagnosticsWorker.create()

  const diagnosticsAfterCreate = await overallDiagnosticsWorker.getDiagnostics()
  deepStrictEqual(diagnosticsAfterCreate, {
    workersCreatedCount: 3,
    workersDiagnostics: [
      {
        callCount: 1,
        dynamicRefCount: 0
      },
      {
        callCount: 1,
        dynamicRefCount: 0
      },
      {
        callCount: 1,
        dynamicRefCount: 0
      }
    ],
  })

  await worker1.boo()

  await worker2.boo()
  await worker2.boo()

  await worker3.boo()
  await worker3.boo()
  await worker3.boo()

  const diagnosticsAfterCalls = await overallDiagnosticsWorker.getDiagnostics()
  const workersCallCounts = diagnosticsAfterCalls.workersDiagnostics.map(d => d.callCount).sort()
  const workersCallCountsAdjusted = workersCallCounts.map(c => c - workersCallCounts[0])
  deepStrictEqual(workersCallCountsAdjusted, [0, 1, 2])

  await overallDiagnosticsWorker.close(worker2)
  const diagnosticsAfterClose = await overallDiagnosticsWorker.getDiagnostics()
  strictEqual(diagnosticsAfterClose.workersCreatedCount, 3)
  const workersCallCounts2 = diagnosticsAfterClose.workersDiagnostics.map(d => d.callCount).sort()
  const workersCallCounts2Adjusted = workersCallCounts2.map(c => c - workersCallCounts2[0])
  deepStrictEqual(workersCallCounts2Adjusted, [0, 2])

  await overallDiagnosticsWorker.close(worker1)
  await overallDiagnosticsWorker.close(worker3)
  const lastDiagnostics = await overallDiagnosticsWorker.getDiagnostics()
  deepStrictEqual(lastDiagnostics, {
    workersCreatedCount: 3,
    workersDiagnostics: [],
  })
})
