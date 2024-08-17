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
    name: workerId,
  })
  // TODO: Add back in beforeExit handler? I hit a MaxListenersExceededWarning.
  // const beforeExitHandler = () => {
  //   void worker.terminate()
  // }
  // process.on("beforeExit", beforeExitHandler)
  return {
    ...wrapNodeInterface(worker),
    terminate: async () => {
      // process.off("beforeExit", beforeExitHandler)
      await worker.terminate()
    },
  }
}

export function getWorkerInterfaceForThis<
  ReceiveMessage,
  SendMessage
>(): WorkerAbstraction<ReceiveMessage, SendMessage> {
  assert(parentPort)
  return {
    ...wrapNodeInterface(parentPort),
    terminate: async () => undefined,
  }
}

function wrapNodeInterface<ReceiveMessage, SendMessage>(
  port: MessagePort | Worker
): Omit<WorkerAbstraction<ReceiveMessage, SendMessage>, "terminate"> {
  return {
    onMessage(callback) {
      port.on("message", callback)
    },
    postMessage(data) {
      port.postMessage(data)
    },
  }
}
