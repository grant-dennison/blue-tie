export type WorkerDiagnostics = {
  readonly callCount: number
  readonly dynamicRefCount: number
}

export type OverallDiagnostics = {
  readonly workersCreatedCount: number
  readonly workersDiagnostics: readonly WorkerDiagnostics[]
}
