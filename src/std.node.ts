export { default as assert } from "node:assert"
export { randomUUID } from "node:crypto"
export { isMainThread, workerData } from "node:worker_threads"
export { getWorkerInterfaceForThis, makeWorker } from "./worker-abstraction.node"

