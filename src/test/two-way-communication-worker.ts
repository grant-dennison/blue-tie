import { isNode } from "environment"
import { defineWorker } from "worker-pool"
import { getBrowserScript } from "./script.browser"

export default defineWorker(
  "2-way worker",
  isNode ? __filename : getBrowserScript(),
  {
    getFunction: async (prefix: string) => {
      let i = 0
      return async (input: string) => {
        return `${prefix}${input}${i++}`
      }
    },
    runFunction: async <T extends (...args: any) => any>(
      run: T,
      args: Parameters<T>
    ) => run(...args),
  }
)
