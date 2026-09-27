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
// 3. a TENTACLE facing an adjacent enemy organ (B+C);
// 4. a SPORER facing the longest free line, then SPORE a new root far along
//    it (next to a source if possible) when we hold one of each protein;
// 5. else another affordable organ type as filler, else WAIT.

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
  const enemy = new Set<number>()
  const sources = new Set<number>()
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const x = +p[0]
    const y = +p[1]
    const type = p[2]
    const owner = +p[3]
    grid[y * W + x] = type === "WALL" ? "#" : owner >= 0 ? (owner === 1 ? "M" : "O") : type
    if ("ABCD".includes(type) && type.length === 1) sources.add(y * W + x)
    if (owner === 0) enemy.add(y * W + x)
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
    // 2. Tentacle next to an enemy organ (it attacks the cell it faces).
    if (order === "WAIT" && stock[1] >= 1 && stock[2] >= 1)
      for (const o of organs) {
        for (const [dx, dy] of DIRS) {
          const x = o.x + dx
          const y = o.y + dy
          if (!free(x, y) || used.has(y * W + x)) continue
          const face = DIRS.find(([fx, fy]) => enemy.has((y + fy) * W + x + fx) && inside(x + fx, y + fy))
          if (face) {
            order = `GROW ${o.id} ${x} ${y} TENTACLE ${face[2]}`
            used.add(y * W + x)
            stock[1]--
            stock[2]--
            break
          }
        }
        if (order !== "WAIT") break
      }
    // 3. Sporer / spore: new roots far away (one of each protein per root).
    if (order === "WAIT") {
      const sporer = organs.find(o => o.type === "SPORER")
      const lineCells = (x: number, y: number, dx: number, dy: number) => {
        const cells: number[] = []
        for (let k = 1; ; k++) {
          const cx = x + dx * k
          const cy = y + dy * k
          if (!free(cx, cy)) break
          cells.push(cy * W + cx)
        }
        return cells
      }
      if (sporer && stock.every(v => v >= 1)) {
        const d = DIRS.find(dd => dd[2] === sporer.dir)!
        const cells = lineCells(sporer.x, sporer.y, d[0], d[1]).filter(c => !used.has(c))
        // Farthest cell, preferring one next to an unharvested source.
        let best = -1
        let bestV = -1
        cells.forEach((c, k) => {
          if (sources.has(c)) return // a root on a source eats it
          const cx = c % W
          const cy = Math.floor(c / W)
          const nearSource = DIRS.some(([ex, ey]) => sources.has((cy + ey) * W + cx + ex))
          // Best: a free neighbour touching an unharvested source, where a
          // harvester can then face it.
          const harvestSpot = DIRS.some(([ex, ey]) => {
            const mx = cx + ex
            const my = cy + ey
            if (!free(mx, my) || sources.has(my * W + mx)) return false
            return DIRS.some(([fx, fy]) => {
              const t = (my + fy) * W + mx + fx
              return sources.has(t) && !harvested.has(t)
            })
          })
          const v = k + (harvestSpot ? 20 : nearSource ? 10 : 0)
          if (k >= 2 && v > bestV) {
            bestV = v
            best = c
          }
        })
        if (best >= 0) {
          order = `SPORE ${sporer.id} ${best % W} ${Math.floor(best / W)}`
          used.add(best)
          for (let k = 0; k < 4; k++) stock[k]--
        }
      } else if (!sporer && roots.length < 4 && stock[1] >= 2 && stock[3] >= 2 && stock[0] >= 1 && stock[2] >= 1) {
        let best: string | null = null
        let bestLen = 3
        let bestCell = -1
        for (const o of organs)
          for (const [dx, dy] of DIRS) {
            const x = o.x + dx
            const y = o.y + dy
            if (!free(x, y) || used.has(y * W + x) || sources.has(y * W + x)) continue
            for (const [fx, fy, name] of DIRS) {
              const len = lineCells(x, y, fx, fy).length
              if (len > bestLen) {
                bestLen = len
                best = `GROW ${o.id} ${x} ${y} SPORER ${name}`
                bestCell = y * W + x
              }
            }
          }
        if (best) {
          order = best
          used.add(bestCell)
          stock[1]--
          stock[3]--
        }
      }
    }
    // 4. BASIC growth into open space.
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
