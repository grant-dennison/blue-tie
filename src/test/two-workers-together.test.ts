import testLib from "test-lib"
import { worker1, worker2 } from "./two-workers-together"

const { strictEqual, test } = testLib

test("two workers in same file", async () => {
  const worker1Api = worker1.create()
  const worker2Api = worker2.create()
  const result1 = await worker1Api.greet1("mom")
  strictEqual(result1, "hi mom")
  const result2 = await worker2Api.greet2("mom")
  strictEqual(result2, "hey mom")
})
