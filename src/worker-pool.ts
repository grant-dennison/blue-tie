import assert from "node:assert"
import { randomUUID } from "node:crypto"
import { isMainThread, MessagePort, parentPort, Worker } from "node:worker_threads"

type TFuncParams<T, FunctionName extends keyof T> = Parameters<T[FunctionName] extends SomeFunction ? T[FunctionName] : never>
type TFuncReturn<T, FunctionName extends keyof T> = ReturnType<T[FunctionName] extends SomeFunction ? T[FunctionName] : never>

// type CallMessage<T, FunctionName extends keyof T> = {
//   type: "call"
//   callerId: string
//   functionName: FunctionName
//   args: TFuncParams<T, FunctionName>
// }

// type CallResolveMessage<T, FunctionName extends keyof T> = {
//   type: "resolve"
//   callerId: string
//   value: TFuncReturn<T, FunctionName>
// }

// type CallRejectMessage<T> = {
//   type: "reject"
//   callerId: string
//   value: unknown
// }

// type CallResponseMessage<T, FunctionName extends keyof T> =
//   CallResolveMessage<T, FunctionName> |
//   CallRejectMessage<T>

type CallMessage = {
  type: "call"
  callerId: string
  functionName: string
  args: readonly unknown[]
}

type CallResolveMessage = {
  type: "resolve"
  callerId: string
  value: unknown
}

type CallRejectMessage = {
  type: "reject"
  callerId: string
  value: unknown
}

type CallResponseMessage =
  CallResolveMessage |
  CallRejectMessage

const workerExecArgv = process.execArgv.slice()
export function addExecArgv(...newArgs: readonly string[]): void {
  workerExecArgv.push(...newArgs)
}

const rpcSerializedKey = "__$$RPC$$__"

class Rpc {
  constructor(readonly id: string) {}
}

export function defineWorker<T extends Record<string, SomeFunction>>(fileName: string, spec: T): { create: () => WorkerInterface<T> } {
  if (!isMainThread) {
    const pp = parentPort
    assert(pp)
    setUpRpc(pp, spec)

    // const phoneBook = { ...spec }

    // function serialize(thing: unknown) {
    //   if (typeof thing === "function") {
    //     const id = randomUUID()
    //     phoneBook[id] = (...args) => thing(...args)
    //     return { [rpcSerializedKey]: id }
    //   }
    //   return thing
    // }

    // pp.on("message", async <FunctionName extends keyof T>(message: CallMessage<T, FunctionName>) => {
    //   try {
    //     const resultValue = await phoneBook[message.functionName](...message.args)
    //     const successResult: CallResponseMessage<T, FunctionName> = {
    //       type: "resolve",
    //       callerId: message.callerId,
    //       value: serialize(resultValue)
    //     }
    //     pp.postMessage(successResult)
    //   } catch (e) {
    //     const errorResult: CallResponseMessage<T, FunctionName> = {
    //       type: "reject",
    //       callerId: message.callerId,
    //       value: e
    //     }
    //     pp.postMessage(errorResult)
    //   }
    // })
  }
  return {
    create: () => makeWorker(fileName, spec)
  }
}

function makeWorker<T extends Record<string, SomeFunction>>(fileName: string, spec: T): WorkerInterface<T> {
  assert(isMainThread)
  const worker = new Worker(fileName, { execArgv: workerExecArgv })
  process.on("beforeExit", () => {
    void worker.terminate()
  })

  const w = setUpRpc(worker, {})

  // const phoneBook = {}

  // function serialize(thing: unknown) {
  //   if (typeof thing === "function") {
  //     const id = randomUUID()
  //     phoneBook[id] = (...args) => thing(...args)
  //     return { [rpcSerializedKey]: id }
  //   }
  //   return thing
  // }

  // const callerMap = new Map<string, [resolve: (value: unknown) => void, reject: (value: unknown) => void]>()

  // function unserialize(thing: unknown) {
  //   if (thing && typeof thing === "object" && rpcSerializedKey in thing) {
  //     return (...args) => makeCall(thing[rpcSerializedKey], args)
  //   }
  //   return thing
  // }

  // worker.on("message", async <FunctionName extends keyof T>(message: CallResponseMessage<T, FunctionName> | CallMessage<T, FunctionName>) => {
  //   if (message.type === "call") {
  //     try {
  //       const resultValue = await phoneBook[message.functionName](...message.args)
  //       const successResult: CallResponseMessage<T, FunctionName> = {
  //         type: "resolve",
  //         callerId: message.callerId,
  //         value: serialize(resultValue)
  //       }
  //       worker.postMessage(successResult)
  //     } catch (e) {
  //       const errorResult: CallResponseMessage<T, FunctionName> = {
  //         type: "reject",
  //         callerId: message.callerId,
  //         value: e
  //       }
  //       worker.postMessage(errorResult)
  //     }
  //     return
  //   }
  //   const callerCallbacks = callerMap.get(message.callerId)
  //   assert(callerCallbacks)
  //   const [resolve, reject] = callerCallbacks
  //   if (message.type === "reject") {
  //     reject(unserialize(message.value))
  //   } else {
  //     resolve(unserialize(message.value))
  //   }
  // })
  // async function makeCall<FunctionName extends keyof T>(functionName: FunctionName, args: TFuncParams<T, FunctionName>) {
  //   const message: CallMessage<T, FunctionName> = {
  //     type: "call",
  //     callerId: randomUUID(),
  //     functionName,
  //     args,
  //   }
  //   try {
  //     const p = new Promise((resolve, reject) => {
  //       callerMap.set(message.callerId, [resolve, reject])
  //     })
  //     worker.postMessage(message)
  //     const result = await p
  //     return result
  //   } finally {
  //     callerMap.delete(message.callerId)
  //   }
  // }
  return Object.entries(spec).map(([key, value]) => {
    return [key, (...args: unknown[]) => w.makeCall(key, args as TFuncParams<T, keyof T>)] as const
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

function setUpRpc(port: Worker | MessagePort, initialPhoneBook: Record<string, (...args: any) => any>) {
  const phoneBook = { ...initialPhoneBook }

  function serialize(thing: unknown) {
    if (typeof thing === "function") {
      const id = randomUUID()
      phoneBook[id] = (...args) => thing(...args)
      return { [rpcSerializedKey]: id }
    }
    return thing
  }

  const callerMap = new Map<string, [resolve: (value: unknown) => void, reject: (value: unknown) => void]>()

  function unserialize(thing: unknown) {
    if (thing && typeof thing === "object" && rpcSerializedKey in thing) {
      return (...args) => makeCall(thing[rpcSerializedKey], args)
    }
    return thing
  }

  port.on("message", async (message: CallResponseMessage | CallMessage) => {
    if (message.type === "call") {
      try {
        const resultValue = await phoneBook[message.functionName](...message.args.map(a => unserialize(a)))
        const successResult: CallResponseMessage = {
          type: "resolve",
          callerId: message.callerId,
          value: serialize(resultValue)
        }
        port.postMessage(successResult)
      } catch (e) {
        const errorResult: CallResponseMessage = {
          type: "reject",
          callerId: message.callerId,
          value: e
        }
        port.postMessage(errorResult)
      }
      return
    }
    const callerCallbacks = callerMap.get(message.callerId)
    assert(callerCallbacks)
    const [resolve, reject] = callerCallbacks
    if (message.type === "reject") {
      reject(unserialize(message.value))
    } else {
      resolve(unserialize(message.value))
    }
  })
  async function makeCall(functionName: string, args: readonly unknown[]) {
    const message: CallMessage = {
      type: "call",
      callerId: randomUUID(),
      functionName,
      args: args.map(a => serialize(a)),
    }
    try {
      const p = new Promise((resolve, reject) => {
        callerMap.set(message.callerId, [resolve, reject])
      })
      port.postMessage(message)
      const result = await p
      return result
    } finally {
      callerMap.delete(message.callerId)
    }
  }

  return { makeCall }
}
