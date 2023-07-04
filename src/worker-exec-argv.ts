import { isNode } from "./environment"

export const workerExecArgv = isNode ? process.execArgv.slice() : []
export function addExecArgv(...newArgs: readonly string[]): void {
  workerExecArgv.push(...newArgs)
}
