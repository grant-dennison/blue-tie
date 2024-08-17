export function mapObject(
  input: Record<string, unknown>,
  mapper: (value: unknown) => unknown
): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const key in input) {
    output[key] = mapper(input[key])
  }
  return output
}
