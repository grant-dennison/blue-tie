import {
  getWorkerInterfaceForThis,
  makeWorker,
  workerData,
} from "./worker-abstraction.browser"
export const randomUUID = () => crypto.randomUUID()

import type { StdLib } from "./std-lib"

// From https://stackoverflow.com/a/23619712/4639640
const isMainThread = typeof importScripts !== "function"

function assert(
  value: unknown,
  message?: string | Error
): asserts value {
  if (!value) {
    if (!message) {
      throw new Error("assertion failed")
    }
    if (typeof message === "string") {
      throw new Error(message)
    }
    throw message
  }
}

const stdLib: StdLib = {
  assert,
  isMainThread,
  getWorkerInterfaceForThis,
  makeWorker,
  workerData,
  randomUUID: () => crypto.randomUUID(),
}

export default stdLib
