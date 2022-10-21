import { defineWorker } from "worker-pool";

export default defineWorker(__filename, {
  getFunction: async (prefix: string) => {
    let i = 0
    return async (input: string) => {
      return `${prefix}${input}${i++}`
    }
  },
  runFunction: async <T extends (...args: any) => any>(run: T, args: Parameters<T>) => run(...args)
})
