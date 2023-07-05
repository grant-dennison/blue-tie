export async function assertRejects(codeToBreak: () => PromiseLike<unknown>, message: string) {
  let threw = false
  try {
    await codeToBreak()
  } catch (e) {
    threw = true
  }
  if (!threw) {
    throw new Error(message)
  }
}
