export type CallMessage = {
  type: "call"
  callerId: string
  functionName: string
  args: readonly unknown[]
}

export type CallResolveMessage = {
  type: "resolve"
  callerId: string
  value: unknown
}

export type CallRejectMessage = {
  type: "reject"
  callerId: string
  value: unknown
}

export type CallResponseMessage =
  CallResolveMessage |
  CallRejectMessage

export type ReferenceFreeMessage = {
  type: "ref-free"
  referenceIds: readonly string[]
}

export type ReceiveMessage = CallResponseMessage | CallMessage | ReferenceFreeMessage
export type SendMessage = CallResolveMessage | CallRejectMessage | CallMessage
