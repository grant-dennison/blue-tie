import { default as assert } from "node:assert"
import { randomUUID } from "node:crypto"
import { isMainThread, workerData } from "node:worker_threads"
import type { StdLib } from "std-lib"
import {
  getWorkerInterfaceForThis,
  makeWorker,
} from "./worker-abstraction.node"

const stdLib: StdLib = {
  assert,
  isMainThread,
  getWorkerInterfaceForThis,
  makeWorker,
  randomUUID,
  workerData,
}

export default stdLib
