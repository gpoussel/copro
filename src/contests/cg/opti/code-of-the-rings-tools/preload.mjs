// Provides CodinGame's ambient readline() when running a solver locally.
import fs from "node:fs"
const lines = fs.readFileSync(0, "utf8").split("\n")
let k = 0
globalThis.readline = () => lines[k++]
