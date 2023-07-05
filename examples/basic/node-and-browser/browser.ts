import { isMainThread } from "blue-tie"
import { fibonacciWorker } from "./fibonacci-worker"

// Important line #0: If using the same script for worker as main script,
// disambiguate between the two so that the startup code only runs in main thread.
if (isMainThread) {
  // Important line #1: Instantiate the worker.
  const worker = fibonacciWorker.create()

  const nElement = document.getElementById("n") as HTMLInputElement
  const resultElement = document.getElementById("result") as HTMLSpanElement
  let outstandingRequestId: string

  nElement.addEventListener("keyup", (e) => {
    const thisRequestId = crypto.randomUUID()
    outstandingRequestId = thisRequestId
    resultElement.innerText =
      "Calculating... (notice that the UI thread is not frozen)"
    let n = parseInt(nElement.value)
    if (isNaN(n)) {
      resultElement.innerText = "n is NaN"
      return
    }
    if (n > 50) {
      resultElement.innerText = "n is too big"
      return
    }

    // Important line #2: Call a method on the worker instance.
    worker.fibonacci(n).then(
      (result) => {
        if (thisRequestId === outstandingRequestId) {
          resultElement!.innerText = `${result}`
        }
      },
      (e) => {
        window.alert(
          `Error: ${e instanceof Error ? e.message : JSON.stringify(e)}`
        )
      }
    )
  })
}
