import {
  getWorkerInterfaceForThis,
  makeWorker,
  workerId,
} from "./worker-abstraction.browser"
export const randomUUID = () => crypto.randomUUID()

import type { StdLib } from "./std-lib"

// From https://stackoverflow.com/a/23619712/4639640
const isMainThread = typeof importScripts !== "function"

const stdLib: StdLib = {
  isMainThread,
  getWorkerInterfaceForThis,
  makeWorker,
  workerId,
  randomUUID: () => crypto.randomUUID(),
}

export default stdLib
