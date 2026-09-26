// 🎮 CodinGame Puzzle - nonogram-inversor
// https://www.codingame.com/training/hard/nonogram-inversor

// Solve the nonogram (line-solving propagation with a DP over each line, plus
// backtracking if propagation stalls), then read off the white groups.

const [gridW, gridH] = readline().split(" ").map(Number)
const parseClue = (s: string): number[] =>
  s
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(v => v > 0)
const colClues: number[][] = []
for (let i = 0; i < gridW; i++) colClues.push(parseClue(readline()))
const rowClues: number[][] = []
for (let i = 0; i < gridH; i++) rowClues.push(parseClue(readline()))

// Cells: -1 unknown, 0 white, 1 black. Returns the refined line, or null if contradictory.
function solveLine(line: number[], clue: number[]): number[] | null {
  const n = line.length
  const k = clue.length
  const noWhite = (a: number, b: number): boolean => {
    for (let i = a; i < b; i++) if (line[i] === 0) return false
    return true
  }
  // fwd[j][i]: first j blocks fit exactly in cells [0, i) (cell i-1 may be the block end or white)
  const fwd: boolean[][] = Array.from({ length: k + 1 }, () => new Array<boolean>(n + 1).fill(false))
  fwd[0][0] = true
  for (let i = 1; i <= n; i++) fwd[0][i] = fwd[0][i - 1] && line[i - 1] !== 1
  for (let j = 1; j <= k; j++) {
    const len = clue[j - 1]
    for (let i = 1; i <= n; i++) {
      // cell i-1 white
      if (line[i - 1] !== 1 && fwd[j][i - 1]) {
        fwd[j][i] = true
        continue
      }
      // block j ends at i-1, occupies [i-len, i), preceded by a white separator if j > 1
      const s = i - len
      if (s < 0 || !noWhite(s, i)) continue
      if (j === 1) fwd[j][i] = fwd[0][s]
      else fwd[j][i] = s >= 1 && line[s - 1] !== 1 && fwd[j - 1][s - 1]
    }
  }
  // bwd[j][i]: blocks j..k-1 fit in cells [i, n)
  const bwd: boolean[][] = Array.from({ length: k + 1 }, () => new Array<boolean>(n + 1).fill(false))
  bwd[k][n] = true
  for (let i = n - 1; i >= 0; i--) bwd[k][i] = bwd[k][i + 1] && line[i] !== 1
  for (let j = k - 1; j >= 0; j--) {
    const len = clue[j]
    for (let i = n - 1; i >= 0; i--) {
      if (line[i] !== 1 && bwd[j][i + 1]) {
        bwd[j][i] = true
        continue
      }
      const e = i + len
      if (e > n || !noWhite(i, e)) continue
      if (j === k - 1) bwd[j][i] = bwd[k][e]
      else bwd[j][i] = e < n && line[e] !== 1 && bwd[j + 1][e + 1]
    }
  }
  if (!fwd[k][n]) return null
  const canWhite = new Array<boolean>(n).fill(false)
  const canBlack = new Array<boolean>(n).fill(false)
  // cell i white: some j with fwd[j][i] and bwd[j][i+1]
  for (let i = 0; i < n; i++) {
    if (line[i] === 1) continue
    for (let j = 0; j <= k; j++) {
      if (fwd[j][i] && bwd[j][i + 1]) {
        canWhite[i] = true
        break
      }
    }
  }
  // block j placed on [s, s+len): left part fits, right part fits with separators
  const diff = new Array<number>(n + 1).fill(0)
  for (let j = 0; j < k; j++) {
    const len = clue[j]
    for (let s = 0; s + len <= n; s++) {
      const e = s + len
      if (!noWhite(s, e)) continue
      const leftOk = j === 0 ? fwd[0][s] : s >= 1 && line[s - 1] !== 1 && fwd[j][s - 1]
      if (!leftOk) continue
      const rightOk = j === k - 1 ? bwd[k][e] : e < n && line[e] !== 1 && bwd[j + 1][e + 1]
      if (!rightOk) continue
      diff[s]++
      diff[e]--
    }
  }
  let acc = 0
  for (let i = 0; i < n; i++) {
    acc += diff[i]
    if (acc > 0) canBlack[i] = true
  }
  const res = line.slice()
  for (let i = 0; i < n; i++) {
    if (!canWhite[i] && !canBlack[i]) return null
    if (!canWhite[i]) res[i] = 1
    else if (!canBlack[i]) res[i] = 0
  }
  return res
}

function propagate(grid: number[][]): boolean {
  let changed = true
  while (changed) {
    changed = false
    for (let y = 0; y < gridH; y++) {
      const r = solveLine(grid[y], rowClues[y])
      if (!r) return false
      for (let x = 0; x < gridW; x++) {
        if (r[x] !== grid[y][x]) {
          grid[y][x] = r[x]
          changed = true
        }
      }
    }
    for (let x = 0; x < gridW; x++) {
      const col = grid.map(row => row[x])
      const r = solveLine(col, colClues[x])
      if (!r) return false
      for (let y = 0; y < gridH; y++) {
        if (r[y] !== grid[y][x]) {
          grid[y][x] = r[y]
          changed = true
        }
      }
    }
  }
  return true
}

function solve(grid: number[][]): number[][] | null {
  if (!propagate(grid)) return null
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (grid[y][x] >= 0) continue
      for (const v of [1, 0]) {
        const copy = grid.map(row => row.slice())
        copy[y][x] = v
        const res = solve(copy)
        if (res) return res
      }
      return null
    }
  }
  return grid
}

const whiteGroups = (line: number[]): string => {
  const groups: number[] = []
  let run = 0
  for (const v of line) {
    if (v === 0) run++
    else if (run > 0) {
      groups.push(run)
      run = 0
    }
  }
  if (run > 0) groups.push(run)
  return groups.length > 0 ? groups.join(" ") : "0"
}

const solved = solve(Array.from({ length: gridH }, () => new Array<number>(gridW).fill(-1)))
if (solved) {
  const out: string[] = []
  for (let x = 0; x < gridW; x++) out.push(whiteGroups(solved.map(row => row[x])))
  for (let y = 0; y < gridH; y++) out.push(whiteGroups(solved[y]))
  console.log(out.join("\n"))
}
