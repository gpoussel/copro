// 🎮 CodinGame Puzzle - vox-codei-episode-1
// https://www.codingame.com/training/hard/vox-codei-episode-1

// Nodes never move, so the whole game can be planned on the first turn with a
// depth-first search over turns: each turn we either wait or drop a bomb on a
// free cell whose blast reaches at least one node not already doomed by a
// pending bomb. Bombs are simulated exactly (3-turn fuse, chain reactions,
// blasts stopped by passive nodes), and failed states are memoized.
const [W, H] = readline().split(" ").map(Number)
const grid: string[][] = []
for (let i = 0; i < H; i++) grid.push(readline().split(""))
const N = W * H

// static blast area of each cell (passive nodes block, range 3)
const blast: number[][] = []
for (let i = 0; i < N; i++) {
  const x = i % W
  const y = (i / W) | 0
  const cells = [i]
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    for (let k = 1; k <= 3; k++) {
      const nx = x + dx * k
      const ny = y + dy * k
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || grid[ny][nx] === "#") break
      cells.push(ny * W + nx)
    }
  }
  blast.push(cells)
}

interface Bomb {
  pos: number
  timer: number
}

const live0: boolean[] = []
for (let i = 0; i < N; i++) live0.push(grid[(i / W) | 0][i % W] === "@")
const wall: boolean[] = []
for (let i = 0; i < N; i++) wall.push(grid[(i / W) | 0][i % W] === "#")

let [rounds, totalBombs] = readline().split(" ").map(Number)

// decrement fuses and resolve explosions (with chain reactions)
function step(live: boolean[], bombs: Bomb[]): [boolean[], Bomb[]] {
  const nl = live.slice()
  let nb = bombs.map(b => ({ pos: b.pos, timer: b.timer - 1 }))
  const queue = nb.filter(b => b.timer <= 0).map(b => b.pos)
  nb = nb.filter(b => b.timer > 0)
  while (queue.length) {
    const p = queue.pop()!
    for (const c of blast[p]) {
      nl[c] = false
      const idx = nb.findIndex(b => b.pos === c)
      if (idx >= 0) {
        queue.push(c)
        nb.splice(idx, 1)
      }
    }
  }
  return [nl, nb]
}

// nodes that pending bombs will destroy (chains included)
function doomedSet(live: boolean[], bombs: Bomb[]): boolean[] {
  const d = new Array<boolean>(N).fill(false)
  const seen = new Set<number>()
  const queue = bombs.map(b => b.pos)
  for (const p of queue) seen.add(p)
  const bombAt = new Set(bombs.map(b => b.pos))
  while (queue.length) {
    const p = queue.pop()!
    for (const c of blast[p]) {
      if (live[c]) d[c] = true
      if (bombAt.has(c) && !seen.has(c)) {
        seen.add(c)
        queue.push(c)
      }
    }
  }
  return d
}

const failed = new Set<string>()
const plan: string[] = []

function dfs(turn: number, live: boolean[], bombs: Bomb[], left: number): boolean {
  if (!live.some(v => v)) return true
  if (turn >= rounds) return false
  const doomed = doomedSet(live, bombs)
  let undoomed = 0
  for (let i = 0; i < N; i++) if (live[i] && !doomed[i]) undoomed++
  if (undoomed > 0 && left === 0) return false
  if (undoomed === 0 && bombs.length === 0) return false
  const key = `${turn}|${left}|${live.map(v => (v ? 1 : 0)).join("")}|${bombs.map(b => b.pos + ":" + b.timer).join(",")}`
  if (failed.has(key)) return false

  // candidate placements, deduplicated by the set of new nodes they reach
  const bombAt = new Set(bombs.map(b => b.pos))
  const cands: [number, number][] = []
  const seenHits = new Set<string>()
  if (undoomed > 0) {
    // bound: best coverage of any cell, even one not yet free
    let best = 0
    for (let i = 0; i < N; i++) {
      if (wall[i]) continue
      const hits = blast[i].filter(c => live[c] && !doomed[c])
      best = Math.max(best, hits.length)
      if (live[i] || bombAt.has(i) || hits.length === 0) continue
      const hk = hits.join(",")
      if (seenHits.has(hk)) continue
      seenHits.add(hk)
      cands.push([i, hits.length])
    }
    if (best * left < undoomed) {
      failed.add(key)
      return false
    }
    cands.sort((a, b) => b[1] - a[1])
  }
  for (const [pos] of cands) {
    const [nl, nb] = step(live, [...bombs, { pos, timer: 3 }])
    plan.push(`${pos % W} ${(pos / W) | 0}`)
    if (dfs(turn + 1, nl, nb, left - 1)) return true
    plan.pop()
  }
  if (bombs.length > 0) {
    const [nl, nb] = step(live, bombs)
    plan.push("WAIT")
    if (dfs(turn + 1, nl, nb, left)) return true
    plan.pop()
  }
  failed.add(key)
  return false
}

dfs(0, live0, [], totalBombs)
let t = 0
while (true) {
  console.log(plan[t++] ?? "WAIT")
  const line = readline()
  if (!line) break
  ;[rounds, totalBombs] = line.split(" ").map(Number)
}
