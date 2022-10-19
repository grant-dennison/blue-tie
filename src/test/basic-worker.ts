import { defineWorker } from "worker-pool";

export default defineWorker(__filename, {
  greet: async (input: string) => {
    return `hi ${input}`
  }
})
