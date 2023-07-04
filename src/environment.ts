// From https://stackoverflow.com/a/31090240/4639640
// export const isBrowser: boolean = (new Function("try {return this===window;}catch(e){return false;}"))()

// From https://stackoverflow.com/a/23619712/4639640
export const isNode =
  typeof process === "object" && typeof require === "function"
export const isBrowser = !isNode
export const isBrowserWorker = isBrowser && typeof importScripts === "function"

let scriptName = "<UNKNOWN>"
if (isBrowser && !isBrowserWorker) {
  // From https://stackoverflow.com/a/2161748/4639640
  const scripts = document.getElementsByTagName("script")
  scriptName = scripts[scripts.length - 1].src.split("?")[0] // remove ?query
}

export function getBrowserScript() {
  if (isNode) {
    throw new Error("Cannot get browser script for Node.js environment")
  }
  return scriptName
}
