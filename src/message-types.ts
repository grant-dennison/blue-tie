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

export type Message = CallResolveMessage | CallRejectMessage | CallMessage
