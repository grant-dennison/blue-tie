import { isNode } from "environment"
import { defineWorker } from "worker-pool"
import { getBrowserScript } from "./script.browser"

export default defineWorker(
  "basic worker",
  isNode ? __filename : getBrowserScript(),
  {
    greet: async (input: string) => {
      return `hi ${input}`
    },
  }
)
