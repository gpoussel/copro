// 🎮 CodinGame Multiplayer - tryangle-catch
// https://www.codingame.com/multiplayer/bot-programming/tryangle-catch
// Referee: https://github.com/eulerscheZahl/TryAngle-Catch
//
// Rules (from the referee): a node is owned by the side with more units on
// it, or by a side holding a majority on every neighbour (surround); a
// triangle is captured when one side owns its 3 nodes and it then STAYS
// captured (+1 point per turn) until the other side captures it, even after
// the units leave. SPAWN uses a triangle owned since last turn: +1 unit, but
// the triangle is lost and cannot be recaptured until we leave its nodes.
// Units on a node whose neighbours all have an enemy majority die.
// Bot: units work in teams of 3: each capturable triangle we do not own is
// priced by the distance of its 3 nearest free units; the cheapest is taken
// first, each unit steps along its shortest path to its corner. Spawn from
// every triangle we own while the army is smaller than the node count.

const houseCount = parseInt(readline())
for (let i = 0; i < houseCount; i++) readline()
let turn = 0

while (true) {
  turn++
  readline() // scores
  const mine = new Int32Array(houseCount)
  const theirs = new Int32Array(houseCount)
  for (let i = 0; i < houseCount; i++) {
    const [h, m, o] = readline().split(" ").map(Number)
    mine[h] = m
    theirs[h] = o
  }
  const adj: number[][] = Array.from({ length: houseCount }, () => [])
  const pc = parseInt(readline())
  for (let i = 0; i < pc; i++) {
    const [a, b] = readline().split(" ").map(Number)
    adj[a].push(b)
    adj[b].push(a)
  }
  const tc = parseInt(readline())
  const triangles: { corners: number[]; owner: number; canCapture: boolean }[] = []
  for (let i = 0; i < tc; i++) {
    const [a, b, c, owner, can] = readline().split(" ").map(Number)
    triangles.push({ corners: [a, b, c], owner, canCapture: can === 1 })
  }
  const lc = parseInt(readline())
  for (let i = 0; i < lc; i++) readline()

  // All-pairs BFS (≤ 50 nodes).
  const dist: Int32Array[] = []
  for (let s = 0; s < houseCount; s++) {
    const d = new Int32Array(houseCount).fill(999)
    d[s] = 0
    const q = [s]
    for (let h = 0; h < q.length; h++)
      for (const m of adj[q[h]])
        if (d[m] === 999) {
          d[m] = d[q[h]] + 1
          q.push(m)
        }
    dist.push(d)
  }
  const enemyMajority = (h: number) => theirs[h] > mine[h]
  const deathTrap = (h: number) => adj[h].length > 0 && adj[h].every(enemyMajority)
  // Our units as a list of positions.
  const units: number[] = []
  for (let h = 0; h < houseCount; h++) for (let k = 0; k < mine[h]; k++) units.push(h)
  const commands: string[] = []

  // Early spawns from triangles we own (costs the triangle's income).
  let army = units.length
  for (const t of triangles) {
    if (t.owner !== 0 || army >= houseCount) continue
    const [a, b, c] = t.corners
    commands.push(`SPAWN ${a} ${b} ${c}`)
    army++
  }

  // Team assignment.
  const free = units.slice()
  const goal: number[] = new Array(units.length).fill(-1) // target node per unit (index in free)
  const targets = triangles.filter(t => t.owner !== 0 && t.canCapture && !t.corners.some(deathTrap))
  const moves: [number, number][] = [] // [from, targetNode]
  const taken = new Set<number>()
  for (;;) {
    const avail = free.map((_, i) => i).filter(i => goal[i] < 0)
    if (avail.length === 0) break
    let best: { t: number; pick: number[]; cost: number } | null = null
    targets.forEach((t, ti) => {
      if (taken.has(ti)) return
      const used = new Set<number>()
      const pick: number[] = []
      let cost = 0
      for (const corner of t.corners) {
        // Already held by more of our units than theirs: no unit needed.
        let bi = -1
        for (const i of avail)
          if (!used.has(i) && (bi < 0 || dist[free[i]][corner] < dist[free[bi]][corner])) bi = i
        if (bi < 0) {
          cost += 50
          continue
        }
        used.add(bi)
        pick.push(bi, corner)
        cost += dist[free[bi]][corner]
      }
      cost += theirs[t.corners[0]] + theirs[t.corners[1]] + theirs[t.corners[2]]
      if (!best || cost < best.cost) best = { t: ti, pick, cost }
    })
    if (!best) break
    const b = best as { t: number; pick: number[]; cost: number }
    taken.add(b.t)
    for (let k = 0; k < b.pick.length; k += 2) {
      goal[b.pick[k]] = b.pick[k + 1]
      moves.push([free[b.pick[k]], b.pick[k + 1]])
    }
    if (b.pick.length === 0) break
  }
  // One step along a shortest path for each unit (skip death traps).
  const step = new Map<string, number>()
  for (const [from, to] of moves) {
    if (from === to) continue
    let next = -1
    for (const m of adj[from])
      if (dist[m][to] === dist[from][to] - 1 && !deathTrap(m) && (next < 0 || theirs[m] < theirs[next])) next = m
    if (next < 0) continue
    const key = `${from} ${next}`
    step.set(key, (step.get(key) ?? 0) + 1)
  }
  for (const [key, amount] of step) commands.push(`MOVE ${key} ${amount}`)
  console.log(commands.length ? commands.join(";") : "WAIT")
}
