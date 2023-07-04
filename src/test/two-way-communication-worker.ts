import { defineWorker } from "worker-pool";

export default defineWorker("2-way worker", __filename, {
  getFunction: async (prefix: string) => {
    let i = 0
    return async (input: string) => {
      return `${prefix}${input}${i++}`
    }
  },
  runFunction: async <T extends (...args: any) => any>(run: T, args: Parameters<T>) => run(...args)
})
