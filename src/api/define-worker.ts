import type { Message } from "message-types"
import stdLib from "std-lib"
import { Rpc, makeRpcWorker, setUpRpc } from "../rpc"
import { assert } from "../assert"
import type { DefinedWorker, SomeFunction, OnlyFunctions, WorkerInterface } from "./api-types"
import type { WorkerDiagnostics } from "./diagnostics"

const {
  getWorkerInterfaceForThis,
  isMainThread,
  workerId: globalWorkerId,
} = stdLib

/**
 * Define a worker.
 * 
 * @param workerId Arbitrary unique ID for worker; protects against bundling.
 * @param fileName Path to worker.
 *   In Node.js, this should usually be `__filename`.
 *   In the browser, this should be a path to a script that also runs this code.
 *   Common value here would be `isNode ? __filename : getBrowserScript()`
 * @param spec Object with functions that will run in the worker.
 * @returns Object to create worker instances.
 */
export function defineWorker<T extends Record<string, SomeFunction>>(
  workerId: string,
  fileName: string,
  spec: T
): DefinedWorker<T> {
  if (!isMainThread && workerId === globalWorkerId) {
    const pp = getWorkerInterfaceForThis<Message, Message>()
    assert(pp)
    setUpRpc(pp, spec)
  }

  let workersCreatedCount = 0
  const workerMap = new Map<WorkerInterface<T>, Rpc<T>>()
  const createWorker = () => {
    const rpc = makeRpcWorker(workerId, fileName, spec)
    workersCreatedCount++
    workerMap.set(rpc.api, rpc)
    return [rpc.api, rpc] as const
  }
  const getRpc = (worker: WorkerInterface<T>) => {
    const rpc = workerMap.get(worker)
    if (!rpc) {
      throw new Error("Worker not found")
    }
    return rpc
  }

  return {
    create: () => createWorker()[0],
    close: async (worker) => {
      const rpc = getRpc(worker)
      const diagnostics = await rpc.getDiagnostics()
      workerMap.delete(worker)
      await rpc.close()
      return diagnostics
    },
    free: async (worker, thing) => {
      const rpc = getRpc(worker)
      await rpc.freeRef(thing)
    },
    getDiagnostics: async () => {
      const workersDiagnostics = await Promise.all([...workerMap.values()].map(rpc => rpc.getDiagnostics()))
      return {
        workersCreatedCount: workersCreatedCount,
        workersDiagnostics: workersDiagnostics,
      }
    },
    withInstance: async (useInstance) => {
      const [worker, rpc] = createWorker()
      let diagnostics: WorkerDiagnostics
      try {
        await useInstance(worker)
        diagnostics = await rpc.getDiagnostics()
      } finally {
        workerMap.delete(worker)
        await rpc.close()
      }
      return diagnostics
    }
  }
}
