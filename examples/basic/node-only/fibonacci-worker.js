const { defineWorker } = require("blue-tie")
const { doFibonacci } = require("./fibonacci-implementation")

exports.fibonacciWorker = defineWorker("fibonacci worker", __filename, {
  fibonacci: async (n) => {
    return doFibonacci(n)
  },
})
