import assert from "node:assert"
import { MessagePort, parentPort, Worker } from "node:worker_threads"
import type { WorkerAbstraction } from "./worker-abstraction"
import { workerExecArgv } from "./worker-exec-argv-private"

export function makeWorker<ReceiveMessage, SendMessage>(
  file: string,
  workerId: string
): WorkerAbstraction<ReceiveMessage, SendMessage> {
  const worker = new Worker(file, {
    execArgv: workerExecArgv,
    workerData: workerId,
  })
  process.on("beforeExit", () => {
    void worker.terminate()
  })
  return wrapNodeInterface(worker)
}

export function getWorkerInterfaceForThis<
  ReceiveMessage,
  SendMessage
>(): WorkerAbstraction<ReceiveMessage, SendMessage> {
  assert(parentPort)
  return wrapNodeInterface(parentPort)
}

function wrapNodeInterface<ReceiveMessage, SendMessage>(
  port: MessagePort | Worker
): WorkerAbstraction<ReceiveMessage, SendMessage> {
  return {
    onMessage(callback) {
      port.on("message", callback)
    },
    postMessage(data) {
      port.postMessage(data)
    },
  }
}
