import { isNode } from "./api/environment"

export const workerExecArgv = isNode ? process.execArgv.slice() : []
export function addExecArgv(...newArgs: readonly string[]): void {
  workerExecArgv.push(...newArgs)
}
