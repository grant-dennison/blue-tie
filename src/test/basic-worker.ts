import { defineWorker } from "worker-pool";

export default defineWorker("basic worker", __filename, {
  greet: async (input: string) => {
    return `hi ${input}`
  }
})
