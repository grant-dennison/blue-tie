import assert from "node:assert"
import { randomUUID } from "node:crypto"
import { isMainThread, parentPort, Worker } from "node:worker_threads"

// const myWorker = defineWorker(__filename, {
//   doSomeWork: (str: string) => Promise.resolve(`hi ${str}`)
// })

// myWorker.create().doSomeWork()

type TFuncParams<T, FunctionName extends keyof T> = Parameters<T[FunctionName] extends SomeFunction ? T[FunctionName] : never>
type TFuncReturn<T, FunctionName extends keyof T> = ReturnType<T[FunctionName] extends SomeFunction ? T[FunctionName] : never>

type CallMessage<T, FunctionName extends keyof T> = {
  type: "call"
  callerId: string
  functionName: FunctionName
  args: TFuncParams<T, FunctionName> // unknown[]
}

type CallResolveMessage<T, FunctionName extends keyof T> = {
  type: "resolve"
  callerId: string
  value: TFuncReturn<T, FunctionName>
}

type CallRejectMessage<T> = {
  type: "reject"
  callerId: string
  value: unknown
}

type CallResponseMessage<T, FunctionName extends keyof T> =
  CallResolveMessage<T, FunctionName> |
  CallRejectMessage<T>

const workerExecArgv = process.execArgv.slice()
export function addExecArgv(...newArgs: readonly string[]): void {
  workerExecArgv.push(...newArgs)
}

export function defineWorker<T extends Record<string, SomeFunction>>(fileName: string, spec: T): { create: () => WorkerInterface<T> } {
  console.log(fileName)
  console.log(process.argv)
  if (!isMainThread) {
    const pp = parentPort
    assert(pp)
    pp.on("message", async <FunctionName extends keyof T>(message: CallMessage<T, FunctionName>) => {
      try {
        const successResult: CallResponseMessage<T, FunctionName> = {
          type: "resolve",
          callerId: message.callerId,
          value: await spec[message.functionName](...message.args)
        }
        pp.postMessage(successResult)
      } catch (e) {
        const errorResult: CallResponseMessage<T, FunctionName> = {
          type: "reject",
          callerId: message.callerId,
          value: e
        }
        pp.postMessage(errorResult)
      }
    })
  }
  return {
    create: () => makeWorker(fileName, spec)
  }
}

function makeWorker<T extends Record<string, SomeFunction>>(fileName: string, spec: T): WorkerInterface<T> {
  assert(isMainThread)
  // const worker = new Worker(fileName)
  // const worker = new Worker(fileName, { execArgv: ["-r", "esbuild-register"]})
  const worker = new Worker(fileName, { execArgv: workerExecArgv })
  const callerMap = new Map<string, [resolve: (value: unknown) => void, reject: (value: unknown) => void]>()
  process.on("beforeExit", () => {
    void worker.terminate()
  })
  worker.on("message", <FunctionName extends keyof T>(message: CallResponseMessage<T, FunctionName>) => {
    const callerCallbacks = callerMap.get(message.callerId)
    assert(callerCallbacks)
    const [resolve, reject] = callerCallbacks
    if (message.type === "reject") {
      reject(message.value)
    } else {
      resolve(message.value)
    }
  })
  async function callWorker<FunctionName extends keyof T>(functionName: FunctionName, args: TFuncParams<T, FunctionName>) {
    const message: CallMessage<T, FunctionName> = {
      type: "call",
      callerId: randomUUID(),
      functionName,
      args,
    }
    try {
      const p = new Promise((resolve, reject) => {
        // resolve(5)
        callerMap.set(message.callerId, [resolve, reject])
      })
      worker.postMessage(message)
      const result = await p
      return result
      // return "hi mom"
    } finally {
      callerMap.delete(message.callerId)
    }
  }
  return Object.entries(spec).map(([key, value]) => {
    return [key, (...args: unknown[]) => callWorker(key, args as TFuncParams<T, keyof T>)] as const
  }).reduce((workerApi, [key, value]) => {
    return {
      ...workerApi,
      [key]: value,
    }
  }, {} as WorkerInterface<T>)
}

const neverSymbol = Symbol("never")
type DebugNever<Message extends string, T = unknown> = [never, T, Message, typeof neverSymbol]
type SomeFunction = (...args: any[]) => any
type WorkerInterface<T> = { [K in keyof T]: T[K] extends SomeFunction ? T[K] : DebugNever<"Field is not a function", [K, T[K]]> }
