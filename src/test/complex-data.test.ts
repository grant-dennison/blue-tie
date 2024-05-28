import testLib from "test-lib"
import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./common/script.browser"

const { deepStrictEqual, test } = testLib

type ComplexData = {
  name: string
  values: {
    thing: unknown
  }[]
}

const complexDataWorker = defineWorker(
  "complex-data worker",
  isNode ? __filename : getBrowserScript(),
  {
    foo: async (input: ComplexData): Promise<ComplexData> => {
      return {
        name: input.name + " Jr.",
        values: [{ thing: 1 }, ...input.values, { thing: "two" }],
      }
    },
  }
)

test("worker can handle complex data types", async () => {
  await complexDataWorker.withInstance(async (workerApi) => {
    const result = await workerApi.foo({
      name: "Joe",
      values: [{ thing: null }, { thing: undefined }],
    })
    deepStrictEqual(result, {
      name: "Joe Jr.",
      values: [
        { thing: 1 },
        { thing: null },
        { thing: undefined },
        { thing: "two" },
      ],
    })
  })
})
