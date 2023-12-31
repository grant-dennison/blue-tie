import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { deepStrictEqual, strictEqual, test } = testLib

const twoWayCommWorker = defineWorker(
  "2-way worker",
  isNode ? __filename : getBrowserScript(),
  {
    getFunction: async (prefix: string) => {
      let i = 0
      return async (input: string) => {
        return `${prefix}${input}${i++}`
      }
    },
    runFunction: async <
      P extends readonly unknown[],
      T extends (...args: P) => unknown
    >(
      run: T,
      args: P
    ) => run(...args),
  }
)

test("worker lib should allow calling a function returned from worker", async () => {
  await twoWayCommWorker.withInstance(async (workerApi) => {
    const run = await workerApi.getFunction("worker-")
    for (let i = 0; i < 100; i++) {
      const result = await run("run")
      strictEqual(result, `worker-run${i}`)
    }
  })
})

test("worker lib should allow passing a function to a worker", async () => {
  await twoWayCommWorker.withInstance(async (workerApi) => {
    let iState = 0
    function run(iPassed: number) {
      return `main-run ${iState++} ${iPassed}`
    }
    for (let i = 0; i < 100; i++) {
      const result = await workerApi.runFunction<
        [number],
        (...args: [number]) => string
      >(run, [i])
      strictEqual(result, `main-run ${i} ${i}`)
    }
  })
})

// This isn't exactly the most methodically developed test.
// It could probably use some work to more clearly demonstrate the capability.
test("worker lib should allow back-and-forth functions", async () => {
  await twoWayCommWorker.withInstance(async (workerApi) => {
    let callNum = 0
    async function runJ(i: number) {
      const strings: string[] = []
      const getL = await workerApi.getFunction("l")
      for (let j = 0; j < 3; j++) {
        await workerApi.runFunction(
          async (k) => {
            strings.push(`i${i} j${j} k${k} ${await getL("l")}`)
          },
          [-1 * j]
        )
      }
      callNum++
      return strings
    }
    for (let i = 0; i < 100; i++) {
      const result = await workerApi.runFunction(runJ, [i])
      deepStrictEqual(result, [
        `i${i} j0 k0 ll0`,
        `i${i} j1 k-1 ll1`,
        `i${i} j2 k-2 ll2`,
      ])
    }
    strictEqual(callNum, 100)
  })
})
