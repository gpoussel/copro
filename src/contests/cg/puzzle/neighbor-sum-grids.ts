// 🎮 CodinGame Puzzle - neighbor-sum-grids
// https://www.codingame.com/training/hard/neighbor-sum-grids

// Values are placed in increasing order: when v >= 3 is placed, the two
// neighbours summing to v are smaller, hence already placed. So v can only
// go on a free cell adjacent to both cells of some pair (a, v - a). Given
// values are pinned to their cells and checked the same way.

const cellsIn: number[] = []
for (let i = 0; i < 5; i++) cellsIn.push(...readline().trim().split(/\s+/).map(Number))

const neighbourMask: boolean[][] = Array.from({ length: 25 }, (_, a) =>
  Array.from({ length: 25 }, (_, b) => {
    const dr = Math.abs(Math.floor(a / 5) - Math.floor(b / 5))
    const dc = Math.abs((a % 5) - (b % 5))
    return a !== b && dr <= 1 && dc <= 1
  })
)

const givenAt = new Array<number>(26).fill(-1) // value -> fixed cell
cellsIn.forEach((v, i) => v && (givenAt[v] = i))
const board = new Array<number>(25).fill(0)
const posOf = new Array<number>(26).fill(-1)

// Cells where v may go: adjacent to both members of a pair summing to v
function candidates(v: number): number[] {
  if (v <= 2) return [...Array(25).keys()]
  const out = new Set<number>()
  for (let a = 1; 2 * a < v; a++) {
    const p = posOf[a]
    const q = posOf[v - a]
    for (let c = 0; c < 25; c++) if (neighbourMask[p][c] && neighbourMask[q][c]) out.add(c)
  }
  return [...out]
}

function solve(v: number): boolean {
  if (v > 25) return true
  const fixed = givenAt[v]
  const options = candidates(v)
  for (const c of fixed >= 0 ? options.filter(x => x === fixed) : options) {
    // Free cells must not steal a cell reserved for a given value
    if (board[c] || (fixed < 0 && cellsIn[c])) continue
    board[c] = v
    posOf[v] = c
    if (solve(v + 1)) return true
    board[c] = 0
    posOf[v] = -1
  }
  return false
}

solve(1)
for (let r = 0; r < 5; r++) console.log(board.slice(r * 5, r * 5 + 5).join(" "))
