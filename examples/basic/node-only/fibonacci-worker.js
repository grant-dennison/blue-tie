const { defineWorker, getBrowserScript, isNode } = require("worker-lib")
const { doFibonacci } = require("./fibonacci-implementation")

exports.fibonacciWorker = defineWorker(
  "fibonacci worker",
  isNode ? __filename : getBrowserScript(),
  {
    fibonacci: async (n) => {
      return doFibonacci(n)
    },
  }
)
