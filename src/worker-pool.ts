import type {
  CallMessage,
  CallResponseMessage,
  ReceiveMessage,
  SendMessage,
} from "message-types"
import {
  assert,
  getWorkerInterfaceForThis,
  isMainThread,
  makeWorker,
  randomUUID,
  workerData,
} from "std"
import type { WorkerAbstraction } from "./worker-abstraction"

export function defineWorker<T extends Record<string, SomeFunction>>(
  workerId: string,
  fileName: string,
  spec: T
): { create: () => WorkerInterface<T> } {
  if (!isMainThread && workerId === workerData) {
    const pp = getWorkerInterfaceForThis<ReceiveMessage, SendMessage>()
    assert(pp)
    setUpRpc(pp, spec)
  }
  return {
    create: () => makeRpcWorker(workerId, fileName, spec),
  }
}

function makeRpcWorker<T extends Record<string, SomeFunction>>(
  workerId: string,
  fileName: string,
  spec: T
): WorkerInterface<T> {
  assert(isMainThread)
  const worker = makeWorker<ReceiveMessage, SendMessage>(fileName, workerId)

  const w = setUpRpc(worker, {})

  return Object.entries(spec)
    .map(([key, value]) => {
      return [key, (...args: unknown[]) => w.makeCall(key, args)] as const
    })
    .reduce((workerApi, [key, value]) => {
      return {
        ...workerApi,
        [key]: value,
      }
    }, {} as WorkerInterface<T>)
}

const neverSymbol = Symbol("never")
type DebugNever<Message extends string, T = unknown> = [
  never,
  T,
  Message,
  typeof neverSymbol
]
type SomeFunction = (...args: any[]) => any
type WorkerInterface<T> = {
  [K in keyof T]: T[K] extends SomeFunction
    ? T[K]
    : DebugNever<"Field is not a function", [K, T[K]]>
}

function setUpRpc(
  port: WorkerAbstraction<ReceiveMessage, SendMessage>,
  initialPhoneBook: Record<string, (...args: any) => any>
) {
  const phoneBook = new Map(Object.entries(initialPhoneBook))

  function serialize(thing: unknown) {
    if (typeof thing === "function") {
      const id = randomUUID()
      phoneBook.set(id, (...args) => thing(...args))
      return { [rpcSerializedKey]: id }
    }
    return thing
  }

  const callerMap = new Map<
    string,
    [resolve: (value: unknown) => void, reject: (value: unknown) => void]
  >()

  function unserialize(thing: unknown) {
    if (instanceOfSerializedRpc(thing)) {
      return (...args: readonly unknown[]) =>
        makeCall(thing[rpcSerializedKey], args)
    }
    return thing
  }

  port.onMessage(async (message) => {
    if (message.type === "ref-free") {
      for (const refId of message.referenceIds) {
        phoneBook.delete(refId)
      }
      return
    }
    if (message.type === "call") {
      try {
        const func = phoneBook.get(message.functionName)
        assert(func)
        const resultValue = await func(
          ...message.args.map((a) => unserialize(a))
        )
        const successResult: CallResponseMessage = {
          type: "resolve",
          callerId: message.callerId,
          value: serialize(resultValue),
        }
        port.postMessage(successResult)
      } catch (e) {
        const errorResult: CallResponseMessage = {
          type: "reject",
          callerId: message.callerId,
          value: e,
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
      args: args.map((a) => serialize(a)),
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

const rpcSerializedKey = "__$$RPC$$__"

interface SerializedRpc {
  [rpcSerializedKey]: string
}

class Rpc {
  constructor(readonly id: string) {}
}

function instanceOfSerializedRpc(o: unknown): o is SerializedRpc {
  return !!o && typeof o === "object" && rpcSerializedKey in o
}
