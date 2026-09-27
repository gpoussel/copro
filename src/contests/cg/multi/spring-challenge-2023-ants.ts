// 🎮 CodinGame Multiplayer - spring-challenge-2023-ants
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2023-ants
//
// Hex cells with eggs (type 1) and crystals (type 2); ants go to beacons in
// proportion to their strength; a resource is harvested at the weakest link
// of an unbroken chain of our ants to one of our bases.
// Bot: grow a harvesting tree each turn from our bases: repeatedly attach
// the resource closest to the current tree (eggs count as closer while the
// game is young and eggs remain), along its shortest path from the nearest
// tree cell, while we keep ≥ 2 ants per tree cell; then a beacon of equal
// strength on every tree cell (chains share cells, so targets are cheap).

const n = parseInt(readline())
const type = new Int8Array(n)
const adj: number[][] = []
for (let i = 0; i < n; i++) {
  const v = readline().split(" ").map(Number)
  type[i] = v[0]
  adj.push(v.slice(2).filter(x => x >= 0))
}
const nb = parseInt(readline())
const myBases = readline().split(" ").map(Number).slice(0, nb)
readline() // opponent bases

// All-pairs distances and next hops (BFS from every cell).
const dist: Int16Array[] = []
const parent: Int16Array[] = []
for (let s = 0; s < n; s++) {
  const d = new Int16Array(n).fill(-1)
  const p = new Int16Array(n).fill(-1)
  d[s] = 0
  const q = [s]
  for (let h = 0; h < q.length; h++)
    for (const m of adj[q[h]])
      if (d[m] < 0) {
        d[m] = d[q[h]] + 1
        p[m] = q[h]
        q.push(m)
      }
  dist.push(d)
  parent.push(p)
}

let turn = 0
let kept: number[] = [] // last turn's targets, attached first (stability)
while (true) {
  turn++
  const res = new Int32Array(n)
  let myAnts = 0
  // Later leagues start the turn with "myScore oppScore" (2 values; cell
  // lines have 3): the first bot read every cell one line off.
  let first: string | null = readline()
  if (first.trim().split(" ").length === 2) first = null
  for (let i = 0; i < n; i++) {
    const line = i === 0 && first !== null ? first : readline()
    const [r, m] = line.split(" ").map(Number)
    res[i] = r
    myAnts += m
  }
  const eggsLeft = [...Array(n).keys()].some(i => type[i] === 1 && res[i] > 0)
  const tree = new Set<number>(myBases)
  const targets = new Set([...Array(n).keys()].filter(i => res[i] > 0 && type[i] > 0))
  const chosen: number[] = []
  const order = kept.filter(t => targets.has(t))
  for (;;) {
    let best = -1
    let bestKey = Infinity
    let from = -1
    const pool = order.length ? [order.shift()!] : [...targets]
    for (const t of pool) {
      let d = Infinity
      let f = -1
      for (const c of tree)
        if (dist[c][t] >= 0 && dist[c][t] < d) {
          d = dist[c][t]
          f = c
        }
      const key = d - (type[t] === 1 && eggsLeft && turn < 30 ? 2 : 0)
      if (key < bestKey) {
        bestKey = key
        best = t
        from = f
      }
    }
    if (best < 0) break
    // Path from the tree cell to the target.
    const path: number[] = []
    for (let c = best; c !== from && c >= 0; c = parent[from][c]) path.push(c)
    const extra = path.filter(c => !tree.has(c)).length
    if (tree.size > myBases.length && (tree.size + extra) * 2 > myAnts) break
    for (const c of path) tree.add(c)
    targets.delete(best)
    chosen.push(best)
  }
  kept = chosen
  const actions = [...tree].map(c => `BEACON ${c} 1`)
  console.log(actions.length ? actions.join(";") : "WAIT")
}
