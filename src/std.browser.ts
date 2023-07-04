export {
  getWorkerInterfaceForThis,
  makeWorker,
  workerData,
} from "./worker-abstraction.browser"
export const randomUUID = () => crypto.randomUUID()

// From https://stackoverflow.com/a/23619712/4639640
export const isMainThread = typeof importScripts !== "function"

export function assert(
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
