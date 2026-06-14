// 🎮 CodinGame Puzzle - blunder-episode-1
// https://www.codingame.com/training/medium/blunder-episode-1

const [L, C] = readline().split(" ").map(Number)
const grid: string[][] = []
for (let i = 0; i < L; i++) {
  grid.push(readline().split(""))
}

let r = 0,
  c = 0
const tels: [number, number][] = []
for (let i = 0; i < L; i++) {
  for (let j = 0; j < C; j++) {
    if (grid[i][j] === "@") {
      r = i
      c = j
    } else if (grid[i][j] === "T") {
      tels.push([i, j])
    }
  }
}

const DIRS: { [k: string]: [number, number] } = {
  SOUTH: [1, 0],
  EAST: [0, 1],
  NORTH: [-1, 0],
  WEST: [0, -1],
}
const normalPrio: string[] = ["SOUTH", "EAST", "NORTH", "WEST"]
const invPrio: string[] = ["WEST", "NORTH", "EAST", "SOUTH"]

let dir = "SOUTH"
let breaker = false
let inverted = false
const broken: Set<string> = new Set()

const out: string[] = []
const seen: Set<string> = new Set()
let loop = false

function stateKey(): string {
  return `${r},${c},${dir},${breaker},${inverted},${[...broken].sort().join("|")}`
}

function blocked(d: string): boolean {
  const [dr, dc] = DIRS[d]
  const nr = r + dr
  const nc = c + dc
  const cell = grid[nr][nc]
  if (cell === "#") return true
  if (cell === "X" && !breaker && !broken.has(`${nr},${nc}`)) return true
  return false
}

while (true) {
  const key = stateKey()
  if (seen.has(key)) {
    loop = true
    break
  }
  seen.add(key)

  const prio = inverted ? invPrio : normalPrio

  if (blocked(dir)) {
    for (const cand of prio) {
      if (!blocked(cand)) {
        dir = cand
        break
      }
    }
  }

  const [dr, dc] = DIRS[dir]
  const nr = r + dr
  const nc = c + dc
  const cell = grid[nr][nc]
  if (cell === "X" && breaker) {
    broken.add(`${nr},${nc}`)
  }

  out.push(dir)
  r = nr
  c = nc

  const ch = grid[r][c]
  if (ch === "$") {
    break
  } else if (ch === "S" || ch === "E" || ch === "N" || ch === "W") {
    dir = ch === "S" ? "SOUTH" : ch === "E" ? "EAST" : ch === "N" ? "NORTH" : "WEST"
  } else if (ch === "I") {
    inverted = !inverted
  } else if (ch === "B") {
    breaker = !breaker
  } else if (ch === "T") {
    const [t1, t2] = tels
    if (r === t1[0] && c === t1[1]) {
      r = t2[0]
      c = t2[1]
    } else {
      r = t1[0]
      c = t1[1]
    }
  }
}

if (loop) {
  console.log("LOOP")
} else {
  console.log(out.join("\n"))
}
