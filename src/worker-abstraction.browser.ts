import type { WorkerAbstraction } from "./worker-abstraction"

export const workerId = decodeURIComponent(self.location.hash.replace(/^#/, ""))

export function makeWorker<ReceiveMessage, SendMessage>(
  file: string,
  workerId: string
): WorkerAbstraction<ReceiveMessage, SendMessage> {
  const worker = new Worker(`${file}#${encodeURIComponent(workerId)}`, {
    name: workerId,
  })
  // TODO: Should I do some beforeunload or something to terminate?
  // window.addEventListener("beforeunload", () => {
  //   worker.terminate()
  // })
  return wrapBrowserInterface(worker)
}

export function getWorkerInterfaceForThis<
  ReceiveMessage,
  SendMessage
>(): WorkerAbstraction<ReceiveMessage, SendMessage> {
  return {
    onMessage(callback) {
      self.onmessage = (event) => {
        callback(event.data as ReceiveMessage)
      }
    },
    postMessage(data) {
      self.postMessage(data)
    },
    terminate: async () => undefined,
  }
}

function wrapBrowserInterface<ReceiveMessage, SendMessage>(
  worker: Worker
): WorkerAbstraction<ReceiveMessage, SendMessage> {
  return {
    onMessage(callback) {
      worker.onmessage = (event) => {
        const data = event.data as ReceiveMessage
        callback(data)
      }
    },
    postMessage(data) {
      worker.postMessage(data)
    },
    terminate: async () => worker.terminate(),
  }
}
