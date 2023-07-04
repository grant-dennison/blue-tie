import type {
  ReceiveMessage,
  SendMessage
} from "message-types"
import stdLib from "std-lib"
import { makeRpcWorker, setUpRpc } from "../rpc"
import { assert } from "../assert"
import type { DefinedWorker, SomeFunction, WorkerInterface } from "./api-types"

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
    const pp = getWorkerInterfaceForThis<ReceiveMessage, SendMessage>()
    assert(pp)
    setUpRpc(pp, spec)
  }
  return {
    create: () => makeRpcWorker(workerId, fileName, spec),
  }
}
