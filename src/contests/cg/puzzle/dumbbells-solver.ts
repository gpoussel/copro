// 🎮 CodinGame Puzzle - dumbbells-solver
// https://www.codingame.com/training/hard/dumbbells-solver

// Backtracking: first cover every marked weight (first uncovered one in
// row-major order, 4 possible directions), then place the remaining dumbbells
// on unmarked squares only, in increasing order of their first cell.

const dbCount = parseInt(readline())
const [dbH, dbW] = readline().trim().split(/\s+/).map(Number)
const marks: string[] = []
for (let i = 0; i < dbH; i++) marks.push(readline())

const out: string[][] = marks.map(row => row.split(""))
const used: boolean[][] = marks.map(row => row.split("").map(() => false))
const inside = (r: number, c: number): boolean => r >= 0 && c >= 0 && r < dbH && c < dbW
const dirs: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

let totalMarks = 0
for (const row of marks) for (const ch of row) if (ch === "o") totalMarks++

const setDumbbell = (r: number, c: number, dr: number, dc: number, on: boolean): void => {
  used[r][c] = on
  used[r + dr][c + dc] = on
  used[r + 2 * dr][c + 2 * dc] = on
  out[r][c] = on ? "o" : marks[r][c]
  out[r + 2 * dr][c + 2 * dc] = on ? "o" : marks[r + 2 * dr][c + 2 * dc]
  out[r + dr][c + dc] = on ? (dr === 0 ? "-" : "|") : "."
}

const canPlace = (r: number, c: number, dr: number, dc: number, onlyEmpty: boolean): boolean => {
  const mr = r + dr
  const mc = c + dc
  const er = r + 2 * dr
  const ec = c + 2 * dc
  if (!inside(er, ec)) return false
  if (used[r][c] || used[mr][mc] || used[er][ec]) return false
  if (marks[mr][mc] === "o") return false
  if (onlyEmpty && (marks[r][c] === "o" || marks[er][ec] === "o")) return false
  return true
}

// Phase 2: dumbbells made only of unmarked squares
const fillEmpty = (left: number, from: number): boolean => {
  if (left === 0) return true
  for (let p = from; p < dbH * dbW; p++) {
    const r = Math.floor(p / dbW)
    const c = p % dbW
    for (const [dr, dc] of dirs.slice(0, 2)) {
      if (!canPlace(r, c, dr, dc, true)) continue
      setDumbbell(r, c, dr, dc, true)
      if (fillEmpty(left - 1, p + 1)) return true
      setDumbbell(r, c, dr, dc, false)
    }
  }
  return false
}

// Phase 1: cover marked weights
const coverMarks = (left: number, uncovered: number): boolean => {
  if (uncovered > 2 * left) return false
  if (uncovered === 0) return fillEmpty(left, 0)
  let r = 0
  let c = 0
  search: for (r = 0; r < dbH; r++) for (c = 0; c < dbW; c++) if (marks[r][c] === "o" && !used[r][c]) break search
  for (const [dr, dc] of dirs) {
    if (!canPlace(r, c, dr, dc, false)) continue
    const other = marks[r + 2 * dr][c + 2 * dc] === "o" ? 1 : 0
    setDumbbell(r, c, dr, dc, true)
    if (coverMarks(left - 1, uncovered - 1 - other)) return true
    setDumbbell(r, c, dr, dc, false)
  }
  return false
}

coverMarks(dbCount, totalMarks)
for (const row of out) console.log(row.join(""))
