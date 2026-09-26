// 🎮 CodinGame Puzzle - chain-reaction
// https://www.codingame.com/training/medium/chain-reaction

// Directions indexed clockwise: 0 = up, 1 = right, 2 = down, 3 = left
const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]

const r = parseInt(readline())
const b = parseInt(readline())
const width = b * 5
const pad = (s: string): string => {
  while (s.length < width) s += " "
  return s
}

// legs[i][j] is a bitmask of the directions the button's legs point to
const legs: number[][] = []
for (let i = 0; i < r; i++) {
  const top = pad(readline())
  const mid = pad(readline())
  const bottom = pad(readline())
  const row: number[] = []
  for (let j = 0; j < b; j++) {
    const c = j * 5 + 2
    let mask = 0
    if (top[c] === "|") mask |= 1
    if (mid[c + 1] === "-") mask |= 2
    if (bottom[c] === "|") mask |= 4
    if (mid[c - 1] === "-") mask |= 8
    row.push(mask)
  }
  legs.push(row)
}

const rotate = (mask: number, clockwise: boolean): number =>
  clockwise ? ((mask << 1) | (mask >> 3)) & 15 : ((mask >> 1) | (mask << 3)) & 15

function simulate(si: number, sj: number): number {
  const state = legs.map(row => row.slice())
  let current: number[] = [si * b + sj]
  let clockwise = true
  let rotations = 0
  while (current.length > 0 && rotations < 10_000_000) {
    for (const id of current) {
      const i = Math.floor(id / b)
      const j = id % b
      state[i][j] = rotate(state[i][j], clockwise)
    }
    rotations += current.length
    const next = new Set<number>()
    for (const id of current) {
      const i = Math.floor(id / b)
      const j = id % b
      for (let d = 0; d < 4; d++) {
        if (!(state[i][j] & (1 << d))) continue
        const ni = i + DR[d]
        const nj = j + DC[d]
        if (ni < 0 || nj < 0 || ni >= r || nj >= b) continue
        if (state[ni][nj] & (1 << ((d + 2) % 4))) next.add(ni * b + nj)
      }
    }
    current = []
    next.forEach(id => current.push(id))
    clockwise = !clockwise
  }
  return rotations
}

let best = -1
let bestI = 0
let bestJ = 0
for (let i = 0; i < r; i++) {
  for (let j = 0; j < b; j++) {
    const count = simulate(i, j)
    if (count > best) {
      best = count
      bestI = i
      bestJ = j
    }
  }
}

console.log(`${bestI} ${bestJ}`)
console.log(best)
