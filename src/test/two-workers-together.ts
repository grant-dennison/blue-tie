import { defineWorker, isNode } from "worker-lib"
import { getBrowserScript } from "./script.browser"

export const worker1 = defineWorker(
  "worker1",
  isNode ? __filename : getBrowserScript(),
  {
    greet1: async (input: string) => {
      return `hi ${input}`
    },
  }
)

export const worker2 = defineWorker(
  "worker2",
  isNode ? __filename : getBrowserScript(),
  {
    greet2: async (input: string) => {
      return `hey ${input}`
    },
  }
)
