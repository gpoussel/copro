// Writes a reconstructed replay's inputs for `pseudo`'s seat as one CodinGame stdin stream (init, then
// every turn's input), to feed the C++ bot: ./tfbot planall < out.txt (stderr: its plans / re-plans).
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs dumpinputs.ts <pseudo> replay.json > out.txt
import { reconstruct } from "./recon.js"
import { initInput, turnInput } from "./engine.js"
const r = reconstruct(process.argv[3])!
const seat = r.pseudos.indexOf(process.argv[2])
const lines = [...initInput(r.states[0], seat)]
for (let t = 0; t < r.outs.length; t++) lines.push(...turnInput(r.states[t], seat))
console.log(lines.join("\n"))
