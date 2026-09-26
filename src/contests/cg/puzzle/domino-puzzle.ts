// 🎮 CodinGame Puzzle - domino-puzzle
// https://www.codingame.com/training/medium/domino-puzzle

const size = parseInt(readline())
const field: string[][] = []
for (let i = 0; i < size; i++) field.push(readline().trim().split(/\s+/))

const BACKSLASH = "\\"

// Given a piece and the motion vector (dr, dc) of what hits it, return the cells it knocks
// over, or null if it cannot be hit from that direction.
function fall(piece: string, dr: number, dc: number): [number, number][] | null {
  if (piece === "|") {
    if (dc === 0) return null
    return [[0, dc]]
  }
  if (piece === "-") {
    if (dr === 0) return null
    return [[dr, 0]]
  }
  if (piece === "/") {
    if (dr === -dc) return null // hit from right-top or left-bottom diagonal
    const s = dr + dc > 0 ? 1 : -1 // down-right or up-left
    return [
      [0, s],
      [s, 0],
      [s, s],
    ]
  }
  if (piece === BACKSLASH) {
    if (dr === dc) return null // hit from left-top or right-bottom diagonal
    const s = dc - dr > 0 ? 1 : -1 // up-right (s=1) or down-left (s=-1)
    return [
      [0, s],
      [-s, 0],
      [-s, s],
    ]
  }
  return null
}

let pieces = 0
for (const row of field) for (const cell of row) if (cell !== ".") pieces++

const fallen: boolean[][] = field.map(row => row.map(() => false))
let fallenCount = 0
const first = field[0][0]
const initialMotion: [number, number] = first === "|" ? [0, 1] : first === "-" ? [1, 0] : [1, 1]
const queue: [number, number, number, number][] = [[0, 0, initialMotion[0], initialMotion[1]]]

for (let qi = 0; qi < queue.length; qi++) {
  const [r, c, dr, dc] = queue[qi]
  if (r < 0 || r >= size || c < 0 || c >= size || fallen[r][c]) continue
  const hits = fall(field[r][c], dr, dc)
  if (!hits) continue
  fallen[r][c] = true
  fallenCount++
  for (const [hr, hc] of hits) queue.push([r + hr, c + hc, hr, hc])
}

console.log(pieces - fallenCount)
