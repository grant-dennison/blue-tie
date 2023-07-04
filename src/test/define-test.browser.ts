import stdLib from "std-lib.browser"
const { isMainThread } = stdLib

export function test(
  description: string,
  implementation: () => void | PromiseLike<void>
) {
  if (!isMainThread) {
    return
  }

  const outputElement =
    document.getElementById("test-output") ?? document.createElement("div")

  Promise.resolve(implementation()).then(
    () => {
      console.log(`PASS: ${description}`)
      outputElement.appendChild(createPassElement(description))
    },
    (e) => {
      console.error(`FAIL: ${description}`)
      console.error(e)
      outputElement.appendChild(createFailElement(description, e))
    }
  )

  // try {
  //   implementation()
  //   console.log(`PASS: ${description}`)
  //   outputElement.appendChild(createPassElement(description))
  // } catch (e) {
  //   console.error(`FAIL: ${description}`)
  //   console.error(e)
  //   outputElement.appendChild(createFailElement(description, e))
  // }
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
    return `${e.message}\n${e.stack}`
  }
  return JSON.stringify(e)
}
