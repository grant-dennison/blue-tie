import type {
  CallMessage,
  CallRejectMessage,
  CallResolveMessage,
  Message,
} from "message-types"
import stdLib from "std-lib"
import type { SomeFunction, OnlyFunctions, WorkerInterface } from "./api/api-types"
import { assert } from "./assert"
import type { WorkerAbstraction } from "./worker-abstraction"
import type { WorkerDiagnostics } from "api/diagnostics"

const {
  isMainThread,
  makeWorker,
  randomUUID,
} = stdLib

export type Rpc<T> = {
  api: WorkerInterface<T>
  close: () => PromiseLike<void>
  getDiagnostics: () => PromiseLike<WorkerDiagnostics>
  freeRef: (thing: unknown) => PromiseLike<void>
}

export function makeRpcWorker<T extends Record<string, SomeFunction>>(
  workerId: string,
  fileName: string,
  spec: T
): Rpc<T> {
  assert(isMainThread)
  const worker = makeWorker<Message, Message>(fileName, workerId)

  const rpc = setUpRpc(worker, {})

  const specMappedToRpc = Object.entries(spec)
    .map(([key]) => {
      return [key, (...args: unknown[]) => rpc.makeCall(key, args)] as const
    })
    .reduce((workerApi, [key, value]) => {
      return {
        ...workerApi,
        [key]: value,
      }
    }, {} as OnlyFunctions<T>)

  return {
    api: specMappedToRpc,
    close: () => worker.terminate(),
    getDiagnostics: () => rpc.makeCall<() => PromiseLike<WorkerDiagnostics>>(rpcDiagnosticsKey, []),
    freeRef: rpc.freeRef,
    // freeRef: (thing) => rpc.makeCall<(thing: unknown) => PromiseLike<void>>(rpcFreeRefKey, [[thing]])
  }
}

export function setUpRpc(
  port: WorkerAbstraction<Message, Message>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialPhoneBook: Record<string, SomeFunction>
) {
  let calls = 0
  const initialPhoneBookEntries = Object.entries(initialPhoneBook)
  const initialPhoneBookSize = initialPhoneBookEntries.length
  const metaPhoneBookSize = 2 // based on manual sets below
  const phoneBook = new Map(initialPhoneBookEntries)
  phoneBook.set(rpcDiagnosticsKey, async () => {
    const diagnostics: WorkerDiagnostics = {
      callCount: calls,
      dynamicRefCount: phoneBook.size - initialPhoneBookSize - metaPhoneBookSize,
    }
    return diagnostics
  })
  phoneBook.set(rpcFreeRefKey, async (referenceIds: readonly string[]) => {
    for (const refId of referenceIds) {
      phoneBook.delete(refId)
    }
  })

  function serialize(thing: unknown) {
    if (typeof thing === "function") {
      const id = randomUUID()
      phoneBook.set(id, (...args: readonly unknown[]) => thing(...args))
      return { [rpcSerializedKey]: id }
    }
    return thing
  }

  const callerMap = new Map<
    string,
    [resolve: (value: unknown) => void, reject: (value: unknown) => void]
  >()

  const functionToRemoteRefId = new Map<unknown, string>()
  function unserialize(thing: unknown) {
    if (instanceOfSerializedRpc(thing)) {
      const id = thing[rpcSerializedKey]
      const thinFunc = (...args: readonly unknown[]) =>
        makeCall(id, args)
      functionToRemoteRefId.set(thinFunc, id)
      return thinFunc
    }
    return thing
  }

  async function handleMessage(message: Message) {
    if (message.type === "call") {
      calls++
      try {
        const func = phoneBook.get(message.functionName)
        assert(func)
        const resultValue = await func(
          ...message.args.map((a) => unserialize(a))
        )
        const successResult: CallResolveMessage = {
          type: "resolve",
          callerId: message.callerId,
          value: serialize(resultValue),
        }
        port.postMessage(successResult)
      } catch (e) {
        const errorResult: CallRejectMessage = {
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
  }

  function syncHandleMessage(message: Message) {
    handleMessage(message).then(
      () => {
        // Do nothing.
      },
      (e) => {
        console.error("Unrecoverable error", e)
      }
    )
  }

  port.onMessage(syncHandleMessage)
  async function makeCall<FunctionType extends (...args: readonly any[]) => PromiseLike<unknown>>(functionName: string, args: Readonly<Parameters<FunctionType>>): Promise<Awaited<ReturnType<FunctionType>>> {
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
      const result = await (p as ReturnType<FunctionType>)
      return result
    } finally {
      callerMap.delete(message.callerId)
    }
  }

  return {
    makeCall,
    freeRef: async (thing: unknown) => {
      const id = functionToRemoteRefId.get(thing)
      if (!id) {
        throw new Error("Nothing found to free")
      }
      functionToRemoteRefId.delete(thing)
      await makeCall<(referenceIds: readonly string[]) => PromiseLike<void>>(rpcFreeRefKey, [[id]])
    },
  }
}

const rpcSerializedKey = "__$$RPC$$__"
const rpcDiagnosticsKey = "__$$RPC_getDiagnostics$$__"
const rpcFreeRefKey = "__$$RPC_freeRef$$__"

interface SerializedRpc {
  [rpcSerializedKey]: string
}

function instanceOfSerializedRpc(o: unknown): o is SerializedRpc {
  return !!o && typeof o === "object" && rpcSerializedKey in o
}
