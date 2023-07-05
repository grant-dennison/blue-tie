import { isMainThread } from "blue-tie"
import { fibonacciWorker } from "./fibonacci-worker"

async function run() {
  if (process.argv.length !== 3) {
    throw new Error(`Usage: ${process.argv[1]} <n>`)
  }
  await fibonacciWorker.withInstance(async (worker) => {
    const result = await worker.fibonacci(19)
    console.log(result)
  })
}

if (isMainThread) {
  run().then(
    () => {
      // Do nothing.
    },
    (e) => {
      console.error(e)
      process.exit(1)
    }
  )
}
