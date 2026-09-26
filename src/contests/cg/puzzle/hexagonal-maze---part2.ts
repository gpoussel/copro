// 🎮 CodinGame Puzzle - hexagonal-maze---part2
// https://www.codingame.com/training/hard/hexagonal-maze---part2

// BFS on (cell, collected keys). One move = one direction: step once, then keep
// sliding while standing on '_' and the next cell is passable. Keys are picked
// up where the move ends (they are never sliding cells) and a door is passable
// once its key is held.

const [w, h] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const NAMES = ["UL", "UR", "L", "R", "DL", "DR"]
// [dr, dc] for even rows and odd rows
const EVEN = [
  [-1, -1],
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
]
const ODD = [
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, 0],
  [1, 1],
]

let start = 0
for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (grid[r][c] === "S") start = r * w + c

const passable = (r: number, c: number, keys: number): boolean => {
  if (r < 0 || r >= h || c < 0 || c >= w) return false
  const ch = grid[r][c]
  if (ch === "#") return false
  if (ch >= "A" && ch <= "D") return (keys & (1 << (ch.charCodeAt(0) - 65))) !== 0
  return true
}

const N = w * h * 16
const prev = new Int32Array(N).fill(-1)
const prevDir = new Int8Array(N)
const startState = start * 16
prev[startState] = startState
const queue: number[] = [startState]
let goal = -1
for (let qi = 0; qi < queue.length && goal < 0; qi++) {
  const s = queue[qi]
  const keys = s & 15
  const cell = s >> 4
  for (let d = 0; d < 6; d++) {
    let r = Math.floor(cell / w)
    let c = cell % w
    let delta = (r & 1 ? ODD : EVEN)[d]
    if (!passable(r + delta[0], c + delta[1], keys)) continue
    r += delta[0]
    c += delta[1]
    while (grid[r][c] === "_") {
      delta = (r & 1 ? ODD : EVEN)[d]
      if (!passable(r + delta[0], c + delta[1], keys)) break
      r += delta[0]
      c += delta[1]
    }
    const ch = grid[r][c]
    let nk = keys
    if (ch >= "a" && ch <= "d") nk |= 1 << (ch.charCodeAt(0) - 97)
    const ns = ((r * w + c) << 4) | nk
    if (prev[ns] >= 0) continue
    prev[ns] = s
    prevDir[ns] = d
    if (ch === "E") {
      goal = ns
      break
    }
    queue.push(ns)
  }
}

const path: string[] = []
for (let s = goal; s !== startState; s = prev[s]) path.push(NAMES[prevDir[s]])
console.log(path.reverse().join(" "))
