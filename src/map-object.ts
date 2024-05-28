export function mapObject(
  input: Record<string, unknown>,
  mapper: (value: unknown) => unknown
): Record<string, unknown> {
  return Object.entries(input).reduce(
    (soFar, [key, value]) => ({
      ...soFar,
      [key]: mapper(value),
    }),
    {}
  )
}
