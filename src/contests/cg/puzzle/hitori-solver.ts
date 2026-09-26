// 🎮 CodinGame Puzzle - hitori-solver
// https://www.codingame.com/training/hard/hitori-solver

// Backtracking over the cells in reading order. A cell whose number is unique
// in its row and column is never shaded. Keeping a cell white requires no
// earlier white cell with the same number in its row/column; shading it
// requires no shaded neighbour above/left and that all non-shaded cells stay
// connected (BFS check).

const hn = parseInt(readline())
const hGrid: string[] = []
for (let i = 0; i < hn; i++) hGrid.push(readline().trim())

const shaded: boolean[] = new Array(hn * hn).fill(false)
const mustStay: boolean[] = []
for (let r = 0; r < hn; r++)
  for (let c = 0; c < hn; c++) {
    let dup = false
    for (let k = 0; k < hn; k++) {
      if (k !== c && hGrid[r][k] === hGrid[r][c]) dup = true
      if (k !== r && hGrid[k][c] === hGrid[r][c]) dup = true
    }
    mustStay.push(!dup)
  }

function connected(): boolean {
  const start = shaded[0] ? 1 : 0
  const seen = new Uint8Array(hn * hn)
  const stack = [start]
  seen[start] = 1
  let count = 1
  let total = 0
  for (const s of shaded) if (!s) total++
  while (stack.length) {
    const p = stack.pop()!
    const r = Math.floor(p / hn)
    const c = p % hn
    const nb: number[] = []
    if (r > 0) nb.push(p - hn)
    if (r < hn - 1) nb.push(p + hn)
    if (c > 0) nb.push(p - 1)
    if (c < hn - 1) nb.push(p + 1)
    for (const q of nb)
      if (!seen[q] && !shaded[q]) {
        seen[q] = 1
        count++
        stack.push(q)
      }
  }
  return count === total
}

function canStayWhite(r: number, c: number): boolean {
  const v = hGrid[r][c]
  for (let k = 0; k < c; k++) if (!shaded[r * hn + k] && hGrid[r][k] === v) return false
  for (let k = 0; k < r; k++) if (!shaded[k * hn + c] && hGrid[k][c] === v) return false
  return true
}

function solve(p: number): boolean {
  if (p === hn * hn) return true
  const r = Math.floor(p / hn)
  const c = p % hn
  if (canStayWhite(r, c) && solve(p + 1)) return true
  if (mustStay[p]) return false
  if (r > 0 && shaded[p - hn]) return false
  if (c > 0 && shaded[p - 1]) return false
  shaded[p] = true
  if (connected() && solve(p + 1)) return true
  shaded[p] = false
  return false
}

solve(0)
for (let r = 0; r < hn; r++) {
  let line = ""
  for (let c = 0; c < hn; c++) line += shaded[r * hn + c] ? "*" : hGrid[r][c]
  console.log(line)
}
