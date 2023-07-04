import { randomUUID } from "node:crypto"
import { isMainThread, workerData } from "node:worker_threads"
import type { StdLib } from "./std-lib"
import {
  getWorkerInterfaceForThis,
  makeWorker,
} from "./worker-abstraction.node"

const stdLib: StdLib = {
  isMainThread,
  getWorkerInterfaceForThis,
  makeWorker,
  randomUUID,
  workerId: typeof workerData === "string" ? workerData : "<UNKNOWN>",
}

export default stdLib
