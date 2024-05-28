import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { strictEqual, test } = testLib

type ValueProvider = {
  getValue1: (n: number) => PromiseLike<number>
  getValue2: (n: number) => PromiseLike<number>
}

type DoStuffer = {
  doThe: {
    addThing: (n: number) => PromiseLike<number>
    subThing: (n: number) => PromiseLike<number>
  }
}

const twoWayCommWorker = defineWorker(
  "object-with-functions worker",
  isNode ? __filename : getBrowserScript(),
  {
    getDoStuffer: async (input: ValueProvider): Promise<DoStuffer> => {
      return {
        doThe: {
          async addThing(n) {
            return (await input.getValue1(n)) + (await input.getValue2(n)) + n
          },
          async subThing(n) {
            return (await input.getValue1(n)) - (await input.getValue2(n)) - n
          },
        },
      }
    },
  }
)

test("worker lib should allow calling functions nested inside objects", async () => {
  await twoWayCommWorker.withInstance(async (workerApi) => {
    const oh = await workerApi.getDoStuffer({
      getValue1: async (n) => n * 2,
      getValue2: async (n) => n * 3,
    })
    strictEqual(await oh.doThe.addThing(1), 6)
    strictEqual(await oh.doThe.addThing(2), 12)
    strictEqual(await oh.doThe.subThing(1), -2)
    strictEqual(await oh.doThe.subThing(2), -4)
  })
})
