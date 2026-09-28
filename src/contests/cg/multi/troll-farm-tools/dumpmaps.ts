// Writes referee maps (bench.ts seeds) as CodinGame-style inputs for the C++ bench / arena modes:
// one file per seed = init lines + turn-0 input of seat 0.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs dumpmaps.ts <dir> <from> <to>
import { mkdirSync, writeFileSync } from "fs"
import { initInput, turnInput } from "./engine.js"
import { javaGame } from "./seedmap.js"
const [dir, from, to] = [process.argv[2], +process.argv[3], +process.argv[4]]
mkdirSync(dir, { recursive: true })
for (let s = from; s <= to; s++) {
  const g = javaGame(BigInt(s) * 7919n + 17n)
  writeFileSync(`${dir}/${s}.txt`, [...initInput(g, 0), ...turnInput(g, 0)].join("\n") + "\n")
}
