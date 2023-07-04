import type { WorkerAbstraction } from "./worker-abstraction"

export const workerData = decodeURIComponent(self.location.hash.replace(/^#/, ""))

export function makeWorker<ReceiveMessage, SendMessage>(file: string, workerId: string): WorkerAbstraction<ReceiveMessage, SendMessage> {
  const worker = new Worker(`${file}#${encodeURIComponent(workerId)}`)
  // TODO: Should I do some beforeunload or something to terminate?
  // window.addEventListener("beforeunload", () => {
  //   worker.terminate()
  // })
  return wrapBrowserInterface(worker)
}

export function getWorkerInterfaceForThis<ReceiveMessage, SendMessage>(): WorkerAbstraction<ReceiveMessage, SendMessage> {
  return {
    onMessage(callback) {
      self.onmessage = (event) => {
        callback(event.data)
      }
    },
    postMessage(data) {
      self.postMessage(data)
    },
  }
}

function wrapBrowserInterface<ReceiveMessage, SendMessage>(port: Worker): WorkerAbstraction<ReceiveMessage, SendMessage> {
  return {
    onMessage(callback) {
      port.onmessage = (event) => {
        const data = event.data as ReceiveMessage
        callback(data)
      }
      // addEventListener("message", (event) => {
      //   const data = event.data as ReceiveMessage
      //   callback(data)
      // })
    },
    postMessage(data) {
      port.postMessage(data)
    },
  }
}
