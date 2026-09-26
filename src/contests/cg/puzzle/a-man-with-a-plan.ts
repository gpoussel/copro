// 🎮 CodinGame Puzzle - a-man-with-a-plan
// https://www.codingame.com/training/hard/a-man-with-a-plan

// Dijkstra over (cell, armor, horse, cleared special places). Entering a cell
// costs its terrain (halved by the horse) or the effect of its point of
// interest; the wizard teleports to the closest other point of interest,
// whose effect then applies. The quest ends when reaching the castle after
// clearing the objective.
const [W, H, N] = readline().split(" ").map(Number)
const objective = readline().trim()
const grid: string[] = []
for (let i = 0; i < H; i++) grid.push(readline())
const poiAt = new Map<number, string>()
const pois: [string, number, number][] = []
for (let i = 0; i < N; i++) {
  const [k, xs, ys] = readline().split(" ")
  const x = Number(xs)
  const y = Number(ys)
  poiAt.set(y * W + x, k)
  pois.push([k, x, y])
}
const SPECIALS = ["DRAGON", "TREASURE", "PRINCESS"]
const objBit = 1 << SPECIALS.indexOf(objective)

// wizard destination: closest other point of interest (Manhattan)
let wizardDest = -1
const wiz = pois.find(p => p[0] === "WIZARD")
if (wiz) {
  let best = Infinity
  for (const [k, x, y] of pois) {
    if (k === "WIZARD") continue
    const d = Math.abs(x - wiz[1]) + Math.abs(y - wiz[2])
    if (d < best) {
      best = d
      wizardDest = y * W + x
    }
  }
}

// state = ((cell * 2 + armor) * 2 + horse) * 8 + mask
const S = W * H * 32
const dist = new Array<number>(S).fill(Infinity)
const enc = (cell: number, armor: number, horse: number, mask: number) => ((cell * 2 + armor) * 2 + horse) * 8 + mask

// simple binary heap of [cost, state]
const heap: [number, number][] = []
function push(item: [number, number]): void {
  heap.push(item)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (heap[p][0] <= heap[i][0]) break
    ;[heap[p], heap[i]] = [heap[i], heap[p]]
    i = p
  }
}
function pop(): [number, number] {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length > 0) {
    heap[0] = last
    let i = 0
    while (true) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < heap.length && heap[l][0] < heap[m][0]) m = l
      if (r < heap.length && heap[r][0] < heap[m][0]) m = r
      if (m === i) break
      ;[heap[m], heap[i]] = [heap[i], heap[m]]
      i = m
    }
  }
  return top
}

let answer = -1
const relax = (d: number, s: number) => {
  if (d < dist[s]) {
    dist[s] = d
    push([d, s])
  }
}
// apply the effect of arriving on a point of interest (the castle may end the quest)
function arrivePoi(cell: number, armor: number, horse: number, mask: number, d: number, teleported: boolean): void {
  const k = poiAt.get(cell)!
  if (k === "CASTLE") {
    if (mask & objBit) {
      if (answer < 0 || d < answer) answer = d
      return
    }
    relax(d + 1, enc(cell, armor, horse, mask))
  } else if (k === "HOUSE") relax(d + 1, enc(cell, armor, horse, mask))
  else if (k === "BLACKSMITH") relax(d + 1, enc(cell, 1, horse, mask))
  else if (k === "STABLE") relax(d + 1, enc(cell, armor, 1, mask))
  else if (k === "WIZARD") {
    if (!teleported && wizardDest >= 0) arrivePoi(wizardDest, armor, horse, mask, d + 1, true)
  } else {
    const bit = 1 << SPECIALS.indexOf(k)
    if (mask & bit) relax(d + 1, enc(cell, armor, horse, mask))
    else relax(d + (armor ? 2 : 4), enc(cell, armor, horse, mask | bit))
  }
}

const house = pois.find(p => p[0] === "HOUSE")!
relax(1, enc(house[2] * W + house[1], 0, 0, 0))
while (heap.length) {
  const [d, s] = pop()
  if (d > dist[s]) continue
  if (answer >= 0 && d >= answer) break
  const mask = s & 7
  const horse = (s >> 3) & 1
  const armor = (s >> 4) & 1
  const cell = s >> 5
  const x = cell % W
  const y = Math.floor(cell / W)
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const nc = ny * W + nx
      const t = grid[ny][nx]
      if (t === "I") {
        arrivePoi(nc, armor, horse, mask, d, false)
        continue
      }
      let cost: number
      if (t === "G") cost = 2
      else if (t === "W") {
        if (armor) continue
        cost = 2
      } else if (t === "M") {
        if (horse) continue
        cost = 4
      } else if (t === "S") cost = 6
      else continue
      if (horse) cost /= 2
      relax(d + cost, enc(nc, armor, horse, mask))
    }
}
console.log(answer)
