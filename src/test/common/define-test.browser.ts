import stdLib from "std-lib.browser"
const { isMainThread } = stdLib

let testCount = 0
let successCount = 0
let failCount = 0

export function test(
  description: string,
  implementation: () => void | PromiseLike<void>
) {
  if (!isMainThread) {
    return
  }

  testCount++
  updateSummary()

  const outputElement =
    document.getElementById("test-output") ?? document.createElement("div")

  Promise.resolve(implementation()).then(
    () => {
      successCount++
      console.log(`PASS: ${description}`)
      outputElement.appendChild(createPassElement(description))
      updateSummary()
    },
    (e) => {
      failCount++
      console.error(`FAIL: ${description}`)
      console.error(e)
      outputElement.appendChild(createFailElement(description, e))
      updateSummary()
    }
  )
}

function updateSummary() {
  const el = document.getElementById("test-summary") as HTMLDivElement
  const summary = `${successCount}/${testCount} tests passed`
  el.innerText = summary
  if (failCount > 0) {
    el.style.backgroundColor = "pink"
    el.style.color = "red"
  } else if (successCount >= testCount) {
    el.style.backgroundColor = "lightgreen"
    el.style.color = "darkgreen"
  }
}

function createPassElement(description: string) {
  const el = document.createElement("div")
  el.innerText = `PASS: ${description}`
  return el
}

function createFailElement(description: string, e: unknown) {
  const el = document.createElement("div")
  const title = document.createElement("div")
  title.innerText = `FAIL: ${description}`
  const body = document.createElement("pre")
  body.innerText = stringifyError(e)
  el.appendChild(title)
  el.appendChild(body)
  el.style.backgroundColor = "pink"
  el.style.color = "red"
  return el
}

function stringifyError(e: unknown): string {
  if (typeof e === "string") {
    return e
  }
  if (e instanceof Error) {
    return `${e.message}\n${e.stack ?? "[no stack]"}`
  }
  return JSON.stringify(e)
}
