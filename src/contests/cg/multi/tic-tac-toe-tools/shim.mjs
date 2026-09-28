import { readSync } from "node:fs"
import { pathToFileURL } from "node:url"
let buf = ""
const chunk = Buffer.alloc(65536)
globalThis.readline = () => {
  while (!buf.includes("\n")) {
    let n
    try {
      n = readSync(0, chunk, 0, chunk.length, null)
    } catch (e) {
      if (e.code === "EAGAIN") {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1)
        continue
      }
      throw e
    }
    if (n === 0) process.exit(0)
    buf += chunk.toString("utf8", 0, n)
  }
  const i = buf.indexOf("\n")
  const line = buf.slice(0, i)
  buf = buf.slice(i + 1)
  return line
}
await import(pathToFileURL(process.argv[2]).href)
