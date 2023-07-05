import { addExecArgv as addExecArgvPrivate } from "worker-exec-argv-private"

/**
 * In some cases, you may need to add additional `execArgv` node CLI options
 * for the worker contexts.
 * Chances are you won't need to use this method since
 * "By default, options are inherited from the parent thread."
 *
 * For example, I use `addExecArgv("-r", "esbuild-register")` before my test runs.
 *
 * See https://nodejs.org/api/worker_threads.html#new-workerfilename-options
 */
export function addExecArgv(...newArgs: readonly string[]): void {
  addExecArgvPrivate(...newArgs)
}
