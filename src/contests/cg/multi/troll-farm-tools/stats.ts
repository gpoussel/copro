// Per-seat economy summary of reconstructed replays (anyone's games): score curve, trainings,
// wood / fruit delivered, plantings (type, distance to own shack), trees felled on each side.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs stats.ts [pseudo] replay.json...
import { reconstruct } from "./recon.js"
import { bfs, neighbors, GRASS, ITEMS, score } from "./engine.js"

const args = process.argv.slice(2)
const focus = args[0].endsWith(".json") ? null : args.shift()!
const agg = new Map<string, { n: number; win: number; pts: number; wood: number; fruit: number; plants: number; felledOwn: number; felledTheirs: number }>()
for (const file of args) {
  const r = reconstruct(file)
  if (!r || !r.ok) {
    console.log(file, "reconstruction failed")
    continue
  }
  const g0 = r.states[0]
  const sd = [0, 1].map(p => bfs(g0, neighbors(g0, g0.shack[p]).filter(c => g0.grid[c] === GRASS)))
  const side = (c: number) => (sd[0][c] < sd[1][c] ? 0 : sd[0][c] > sd[1][c] ? 1 : -1)
  const T = r.states.length - 1
  const lines: string[] = []
  for (let p = 0; p < 2; p++) {
    if (focus && r.pseudos[p].toLowerCase() !== focus.toLowerCase()) continue
    const curve = [50, 100, 150, 200, 250, 300].map(t => score(r.states[Math.min(t, T)], p))
    const trains: string[] = []
    let wood = 0
    let fruit = 0
    const plants: string[] = []
    let felledOwn = 0
    let felledTheirs = 0
    for (let t = 0; t < T; t++) {
      const a = r.states[t]
      const b = r.states[t + 1]
      const na = a.trolls.filter(u => u.owner === p).length
      const nb = b.trolls.filter(u => u.owner === p).length
      if (nb > na) {
        const u = b.trolls.filter(x => x.owner === p).pop()!
        trains.push(`t${t + 1}:${u.speed}${u.carry}${u.harvest}${u.chop}`)
      }
      // deliveries: wood is never spent, fruits only leave the shack by PICK / TRAIN
      wood += Math.max(0, b.inv[p][5] - a.inv[p][5])
      for (let i = 0; i < 4; i++) fruit += Math.max(0, b.inv[p][i] - a.inv[p][i])
      for (const tr of b.trees)
        if (!a.trees.some(x => x.cell === tr.cell)) {
          const u = b.trolls.find(x => x.cell === tr.cell && x.owner === p)
          if (u) plants.push(ITEMS[tr.type][0] + sd[p][tr.cell])
        }
      for (const tr of a.trees) {
        if (b.trees.some(x => x.cell === tr.cell && x.type === tr.type)) continue
        const byMe = a.trolls.some(u => u.owner === p && u.cell === tr.cell) || b.trolls.some(u => u.owner === p && u.cell === tr.cell && u.inv[5] > 0)
        if (!byMe) continue
        if (side(tr.cell) === 1 - p) felledTheirs += tr.size
        else felledOwn += tr.size
      }
    }
    const k = r.pseudos[p]
    const s = agg.get(k) ?? { n: 0, win: 0, pts: 0, wood: 0, fruit: 0, plants: 0, felledOwn: 0, felledTheirs: 0 }
    s.n++
    s.win += r.scores[p] > r.scores[1 - p] ? 1 : 0
    s.pts += r.scores[p]
    s.wood += wood
    s.fruit += fruit
    s.plants += plants.length
    s.felledOwn += felledOwn
    s.felledTheirs += felledTheirs
    agg.set(k, s)
    lines.push(
      `  ${k.padEnd(14)} ${String(r.scores[p]).padStart(4)} curve ${curve.join("/")} trains ${trains.join(" ")} | wood ${wood} fruit ${fruit} | felled own ${felledOwn} theirs ${felledTheirs} | plants ${plants.length}: ${plants.join(" ")}`,
    )
  }
  console.log(`${r.gameId} ${r.pseudos.join(" vs ")} ${r.scores.join("-")} (${g0.W}x${g0.H})`)
  for (const l of lines) console.log(l)
}
console.log("\nper player: games wins avgPts avgWood avgFruit avgPlants felledOwn felledTheirs")
for (const [k, s] of [...agg.entries()].sort((a, b) => b[1].n - a[1].n))
  console.log(
    k.padEnd(16),
    s.n,
    s.win,
    (s.pts / s.n).toFixed(0),
    (s.wood / s.n).toFixed(0),
    (s.fruit / s.n).toFixed(0),
    (s.plants / s.n).toFixed(1),
    (s.felledOwn / s.n).toFixed(0),
    (s.felledTheirs / s.n).toFixed(0),
  )
