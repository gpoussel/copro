// 🎮 CodinGame Puzzle - tired-pac-man
// https://www.codingame.com/training/medium/tired-pac-man

const [pmW, pmH] = readline().split(" ").map(Number)
const pmEnergy = parseInt(readline())
const pmRows: string[] = []
for (let r = 0; r < pmH; r++) {
  let row = readline() || ""
  while (row.length < pmW) row += " "
  pmRows.push(row)
}

const CELLS = pmW * pmH
const fruitValue: number[] = new Array(CELLS).fill(0)
const blocked: boolean[] = new Array(CELLS).fill(false)
let pmStart = 0
const FRUIT_POINTS: { [ch: string]: number } = { "*": 5, ".": 1, ")": 3 }

// Neighbours with their move cost (wrapping around an edge costs 3)
const moves: [number, number][][] = []
for (let r = 0; r < pmH; r++) {
  for (let c = 0; c < pmW; c++) {
    const list: [number, number][] = []
    const steps: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    for (const [dr, dc] of steps) {
      let nr = r + dr
      let nc = c + dc
      let cost = 1
      if (nr < 0 || nr >= pmH || nc < 0 || nc >= pmW) {
        nr = (nr + pmH) % pmH
        nc = (nc + pmW) % pmW
        cost = 3
      }
      list.push([nr * pmW + nc, cost])
    }
    moves.push(list)
  }
}

for (let r = 0; r < pmH; r++) {
  for (let c = 0; c < pmW; c++) {
    const idx = r * pmW + c
    const ch = pmRows[r][c]
    if (ch === "#") blocked[idx] = true
    else if (ch === "P") pmStart = idx
    else if (ch === "G") {
      blocked[idx] = true
      for (const [n] of moves[idx]) blocked[n] = true
    } else if (FRUIT_POINTS[ch] !== undefined) fruitValue[idx] = FRUIT_POINTS[ch]
  }
}
blocked[pmStart] = false

const eaten: boolean[] = new Array(CELLS).fill(false)
const stamp: number[] = new Array(CELLS).fill(0)
const processed: number[] = new Array(CELLS).fill(0)
const dist: number[] = new Array(CELLS).fill(0)
const clean: boolean[] = new Array(CELLS).fill(false)
let generation = 0
let bestScore = 0

const hasFruit = (cell: number) => fruitValue[cell] > 0 && !eaten[cell]

// Next targets are fruits reachable by a shortest path that doesn't cross another uneaten fruit
function explore(cur: number, rem: number, score: number): void {
  if (score > bestScore) bestScore = score
  if (rem === 0) return
  const gen = ++generation
  const buckets: number[][] = []
  for (let d = 0; d <= rem; d++) buckets.push([])
  stamp[cur] = gen
  dist[cur] = 0
  clean[cur] = true
  buckets[0].push(cur)
  const candidates: [number, number][] = []
  const valueCounts: { [v: number]: number } = { 1: 0, 3: 0, 5: 0 }
  for (let d = 0; d <= rem; d++) {
    for (const u of buckets[d]) {
      if (processed[u] === gen || dist[u] !== d) continue
      processed[u] = gen
      const fruitHere = u !== cur && hasFruit(u)
      if (fruitHere) {
        valueCounts[fruitValue[u]]++
        if (clean[u]) candidates.push([u, d])
      }
      const pass = clean[u] && !fruitHere
      for (const [v, w] of moves[u]) {
        const nd = d + w
        if (nd > rem || blocked[v]) continue
        if (stamp[v] !== gen || nd < dist[v]) {
          stamp[v] = gen
          dist[v] = nd
          clean[v] = pass
          buckets[nd].push(v)
        } else if (nd === dist[v] && pass) clean[v] = true
      }
    }
  }

  // Upper bound: each remaining move eats at most one reachable fruit
  let slots = rem
  let bound = score
  for (const v of [5, 3, 1]) {
    const take = Math.min(slots, valueCounts[v])
    bound += take * v
    slots -= take
  }
  if (bound <= bestScore) return

  candidates.sort((a, b) => fruitValue[b[0]] - fruitValue[a[0]] || a[1] - b[1])
  for (const [cell, d] of candidates) {
    eaten[cell] = true
    explore(cell, rem - d, score + fruitValue[cell])
    eaten[cell] = false
  }
}

explore(pmStart, pmEnergy, 0)
console.log(bestScore)
