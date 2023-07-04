import type { WorkerAbstraction } from "worker-abstraction"

export type StdLib = {
  readonly isMainThread: boolean
  readonly getWorkerInterfaceForThis: <ReceiveMessage, SendMessage>() => WorkerAbstraction<ReceiveMessage, SendMessage>
  readonly makeWorker: <ReceiveMessage, SendMessage>(
    file: string,
    workerId: string
  ) => WorkerAbstraction<ReceiveMessage, SendMessage>
  readonly randomUUID: () => string
  readonly workerData: string
}
