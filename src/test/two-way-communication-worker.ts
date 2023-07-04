import { defineWorker, isNode } from "worker-lib"
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
    runFunction: async <
      P extends readonly unknown[],
      T extends (...args: P) => unknown
    >(
      run: T,
      args: P
    ) => run(...args),
  }
)
