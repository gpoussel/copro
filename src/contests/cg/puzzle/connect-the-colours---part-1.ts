// 🎮 CodinGame Puzzle - connect-the-colours---part-1
// https://www.codingame.com/training/medium/connect-the-colours---part-1

const [h, w] = readline().split(" ").map(Number)
const tiles: string[] = []
for (let y = 0; y < h; y++) tiles.push(...readline().slice(0, w).split(""))
const size = w * h
const EMPTY = -1
const BLOCKED = -2

// Colours: first occurrence is the path start, second one the target
const colourNames: string[] = []
const start: number[] = []
const target: number[] = []
const owner = new Int16Array(size).fill(EMPTY)
for (let i = 0; i < size; i++) {
  const t = tiles[i]
  if (t === "X") owner[i] = BLOCKED
  else if (/[0-9a-e]/.test(t)) {
    let c = colourNames.indexOf(t)
    if (c < 0) {
      c = colourNames.push(t) - 1
      start.push(i)
      target.push(-1)
    } else target[c] = i
    owner[i] = c
  }
}
const colours = colourNames.length

// Checkpoint cells may only be used by their colour
const checkpoint = new Int16Array(size).fill(-1)
const k = parseInt(readline())
for (let i = 0; i < k; i++) {
  const [x, y, c] = readline().split(" ")
  checkpoint[+y * w + +x] = colourNames.indexOf(c)
}

// Directions: 0 up, 1 right, 2 down, 3 left
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const neighbour = (cell: number, d: number) => {
  const x = (cell % w) + DX[d]
  const y = Math.floor(cell / w) + DY[d]
  return x < 0 || x >= w || y < 0 || y >= h ? -1 : y * w + x
}
// Directional tiles only accept edges along their axis
const axisOk = (cell: number, d: number) =>
  tiles[cell] === "V" ? d % 2 === 0 : tiles[cell] === "H" ? d % 2 === 1 : true
const edgeOk = (from: number, d: number, to: number) => axisOk(from, d) && axisOk(to, d)

const head = start.slice()
const done: boolean[] = new Array(colours).fill(false)
const paths: number[][] = start.map(s => [s])

const movesOf = (c: number): number[] => {
  const moves: number[] = []
  for (let d = 0; d < 4; d++) {
    const to = neighbour(head[c], d)
    if (to < 0 || !edgeOk(head[c], d, to)) continue
    if (to === target[c] || (owner[to] === EMPTY && (checkpoint[to] < 0 || checkpoint[to] === c))) moves.push(to)
  }
  return moves
}

// Pruning: dead-end empty cells, and every empty region must be fillable by a colour that can use it
const component = new Int32Array(size)
const feasible = (): boolean => {
  // An empty cell needs at least two usable edges (to empty cells or open path ends)
  const openEnd = new Int16Array(size).fill(-1)
  for (let c = 0; c < colours; c++) {
    if (done[c]) continue
    openEnd[head[c]] = c
    openEnd[target[c]] = c
  }
  for (let cell = 0; cell < size; cell++) {
    if (owner[cell] !== EMPTY) continue
    let exits = 0
    for (let d = 0; d < 4; d++) {
      const n = neighbour(cell, d)
      if (n < 0 || !edgeOk(cell, d, n)) continue
      if (owner[n] === EMPTY) exits++
      else if (openEnd[n] >= 0 && (checkpoint[cell] < 0 || checkpoint[cell] === openEnd[n])) exits++
    }
    if (exits < 2) return false
  }

  // Label connected empty regions
  component.fill(-1)
  let regions = 0
  const stack: number[] = []
  for (let cell = 0; cell < size; cell++) {
    if (owner[cell] !== EMPTY || component[cell] >= 0) continue
    component[cell] = regions
    stack.push(cell)
    while (stack.length) {
      const u = stack.pop()!
      for (let d = 0; d < 4; d++) {
        const n = neighbour(u, d)
        if (n >= 0 && owner[n] === EMPTY && component[n] < 0) {
          component[n] = regions
          stack.push(n)
        }
      }
    }
    regions++
  }
  const adjacentRegions = (cell: number) => {
    const out: number[] = []
    for (let d = 0; d < 4; d++) {
      const n = neighbour(cell, d)
      if (n >= 0 && owner[n] === EMPTY) out.push(component[n])
    }
    return out
  }
  // served[r][c]: both ends of colour c touch region r
  const served: boolean[][] = []
  for (let r = 0; r < regions; r++) served.push(new Array(colours).fill(false))
  const regionHasColour = new Array(regions).fill(false)
  for (let c = 0; c < colours; c++) {
    if (done[c]) continue
    const fromHead = adjacentRegions(head[c])
    const fromTarget = adjacentRegions(target[c])
    let reachable = neighbourOf(head[c], target[c])
    for (const r of fromHead) {
      if (fromTarget.indexOf(r) >= 0) {
        served[r][c] = true
        regionHasColour[r] = true
        reachable = true
      }
    }
    if (!reachable) return false
  }
  for (let cell = 0; cell < size; cell++) {
    if (owner[cell] !== EMPTY) continue
    const r = component[cell]
    if (!regionHasColour[r]) return false
    if (checkpoint[cell] >= 0 && !served[r][checkpoint[cell]]) return false
  }
  return true
}
const neighbourOf = (a: number, b: number) => {
  for (let d = 0; d < 4; d++) if (neighbour(a, d) === b && edgeOk(a, d, b)) return true
  return false
}

const solve = (): boolean => {
  // Most constrained open colour first
  let best = -1
  let bestMoves: number[] = []
  for (let c = 0; c < colours; c++) {
    if (done[c]) continue
    const moves = movesOf(c)
    if (moves.length === 0) return false
    if (best < 0 || moves.length < bestMoves.length) {
      best = c
      bestMoves = moves
      if (moves.length === 1) break
    }
  }
  if (best < 0) {
    for (let cell = 0; cell < size; cell++) if (owner[cell] === EMPTY) return false
    return true
  }
  const c = best
  const previous = head[c]
  for (const to of bestMoves) {
    paths[c].push(to)
    if (to === target[c]) done[c] = true
    else owner[to] = c
    head[c] = to
    if (feasible() && solve()) return true
    head[c] = previous
    if (to === target[c]) done[c] = false
    else owner[to] = EMPTY
    paths[c].pop()
  }
  return false
}

solve()

// Emit each path as maximal straight segments, one per turn
const segments: string[] = []
for (let c = 0; c < colours; c++) {
  const path = paths[c]
  let from = path[0]
  for (let i = 1; i < path.length; i++) {
    const last = i === path.length - 1
    const straight = !last && path[i + 1] - path[i] === path[i] - path[i - 1]
    if (straight) continue
    segments.push(`${from % w} ${Math.floor(from / w)} ${path[i] % w} ${Math.floor(path[i] / w)} ${colourNames[c]}`)
    from = path[i]
  }
}
for (const segment of segments) console.log(segment)
