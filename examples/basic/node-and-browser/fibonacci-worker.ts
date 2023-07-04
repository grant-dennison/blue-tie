import { defineWorker, getBrowserScript, isNode } from "worker-lib"

export const fibonacciWorker = defineWorker(
  "fibonacci worker",
  isNode ? __filename : getBrowserScript(),
  {
    fibonacci: async (n: number) => {
      return doFibonacci(n)
    },
  }
)

function doFibonacci(n: number): number {
  if (n < 1) {
    return 0
  }
  if (n === 1) {
    return 1
  }
  return doFibonacci(n - 1) + doFibonacci(n - 2)
}
