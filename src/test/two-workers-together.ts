import { defineWorker } from "worker-pool";

export const worker1 = defineWorker("worker1", __filename, {
  greet1: async (input: string) => {
    return `hi ${input}`
  }
})

export const worker2 = defineWorker("worker2", __filename, {
  greet2: async (input: string) => {
    return `hey ${input}`
  }
})
