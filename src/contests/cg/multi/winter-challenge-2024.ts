// 🎮 CodinGame Multiplayer - winter-challenge-2024
// https://www.codingame.com/multiplayer/bot-programming/winter-challenge-2024
//
// Cellularena: organisms grow organs on a grid; the most cells wins.
// Costs: BASIC A, HARVESTER C+D (faces a protein source: +1 of it per
// turn), TENTACLE B+C, SPORER B+D, ROOT (spore) A+B+C+D. Growing on a source
// cell eats it (+3). One action per organism (requiredActionsCount lines).
// Bot, per organism:
// 1. with C and D, a harvester next to an unharvested source, facing it, on
//    a free cell adjacent to one of our organs;
// 2. else a BASIC on the free neighbour cell with the most free space
//    around, never on a source we harvest (other sources are welcome);
// 3. else another affordable organ type as filler, else WAIT.

const [W, H] = readline().split(" ").map(Number)
const DIRS: [number, number, string][] = [
  [0, -1, "N"],
  [1, 0, "E"],
  [0, 1, "S"],
  [-1, 0, "W"],
]

while (true) {
  const n = parseInt(readline())
  const grid: string[] = new Array(W * H).fill(".")
  type Organ = { id: number; x: number; y: number; type: string; dir: string; root: number }
  const mine: Organ[] = []
  const harvested = new Set<number>()
  const sources = new Set<number>()
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const x = +p[0]
    const y = +p[1]
    const type = p[2]
    const owner = +p[3]
    grid[y * W + x] = type === "WALL" ? "#" : owner >= 0 ? (owner === 1 ? "M" : "O") : type
    if ("ABCD".includes(type) && type.length === 1) sources.add(y * W + x)
    if (owner === 1) {
      const o = { id: +p[4], x, y, type, dir: p[5], root: +p[7] }
      mine.push(o)
      if (type === "HARVESTER") {
        const d = DIRS.find(d => d[2] === o.dir)
        if (d) harvested.add((y + d[1]) * W + x + d[0])
      }
    }
  }
  const stock = readline().split(" ").map(Number) // A B C D
  readline() // opponent stock
  const actions = parseInt(readline())
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H
  const free = (x: number, y: number) => inside(x, y) && !"#MO".includes(grid[y * W + x])
  const roots = [...new Set(mine.map(o => o.root))].sort((a, b) => a - b)
  const out: string[] = []
  const used = new Set<number>()
  for (let r = 0; r < actions; r++) {
    const organs = mine.filter(o => o.root === (roots[r] ?? roots[0]))
    let order = "WAIT"
    // 1. Harvester.
    if (stock[2] >= 1 && stock[3] >= 1) {
      let best: string | null = null
      let bestV = -1
      let bestCell = -1
      for (const o of organs)
        for (const [dx, dy] of DIRS) {
          const x = o.x + dx
          const y = o.y + dy
          if (!free(x, y) || sources.has(y * W + x) || used.has(y * W + x)) continue
          for (const [fx, fy, name] of DIRS) {
            const s = (y + fy) * W + x + fx
            if (!inside(x + fx, y + fy) || !sources.has(s) || harvested.has(s)) continue
            // Prefer A (BASIC growth), then the protein we lack most.
            const kind = "ABCD".indexOf(grid[s])
            const v = (kind === 0 ? 10 : 5) - stock[kind] * 0.1
            if (v > bestV) {
              bestV = v
              best = `GROW ${o.id} ${x} ${y} HARVESTER ${name}`
              bestCell = y * W + x
            }
          }
        }
      if (best) {
        order = best
        used.add(bestCell)
        stock[2]--
        stock[3]--
      }
    }
    // 2. BASIC growth into open space.
    if (order === "WAIT") {
      const types: [string, number[]][] = [
        ["BASIC", [1, 0, 0, 0]],
        ["TENTACLE", [0, 1, 1, 0]],
        ["SPORER", [0, 1, 0, 1]],
        ["HARVESTER", [0, 0, 1, 1]],
      ]
      const affordable = types.find(([, c]) => c.every((v, k) => stock[k] >= v))
      if (affordable) {
        let best: string | null = null
        let bestV = -Infinity
        let bestCell = -1
        for (const o of organs)
          for (const [dx, dy] of DIRS) {
            const x = o.x + dx
            const y = o.y + dy
            const c = y * W + x
            if (!free(x, y) || harvested.has(c) || used.has(c)) continue
            let v = DIRS.filter(([ex, ey]) => free(x + ex, y + ey)).length
            if (sources.has(c)) v += 2 // eating a spare source: +3 proteins
            if (v > bestV) {
              bestV = v
              best = `GROW ${o.id} ${x} ${y} ${affordable[0]} N`
              bestCell = c
            }
          }
        if (best) {
          order = best
          used.add(bestCell)
          affordable[1].forEach((v, k) => (stock[k] -= v))
        }
      }
    }
    out.push(order)
  }
  console.log(out.join("\n"))
}
