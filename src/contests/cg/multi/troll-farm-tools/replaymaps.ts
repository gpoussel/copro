// Writes the map of downloaded replays as C++ bench / arena inputs (like dumpmaps.ts), from the
// seat of `pseudo`: <dir>/<gameId>.txt = init lines + turn-0 input.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs replaymaps.ts <dir> <pseudo> replay.json...
import { mkdirSync, writeFileSync } from "fs"
import { initInput, turnInput } from "./engine.js"
import { reconstruct } from "./recon.js"
const [dir, who] = [process.argv[2], process.argv[3]]
mkdirSync(dir, { recursive: true })
for (const f of process.argv.slice(4)) {
  const r = reconstruct(f)
  if (!r) continue
  const seat = Math.max(0, r.pseudos.indexOf(who))
  const g = r.states[0]
  writeFileSync(`${dir}/${r.gameId}.txt`, [...initInput(g, seat), ...turnInput(g, seat)].join("\n") + "\n")
}
