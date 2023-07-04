export { defineWorker } from "./define-worker"
export { getBrowserScript, isBrowser, isNode } from "./environment"
export { addExecArgv } from "./worker-exec-argv"
import stdLib from "std-lib"

/** Is this the main thread (not a worker)? */
export const isMainThread = stdLib.isMainThread
