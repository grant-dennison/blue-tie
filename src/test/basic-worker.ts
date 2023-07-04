import { defineWorker, isNode } from "worker-lib"
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
