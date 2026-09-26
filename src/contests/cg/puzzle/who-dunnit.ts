// 🎮 CodinGame Puzzle - who-dunnit
// https://www.codingame.com/training/hard/who-dunnit

// "Exactly one clue of each line is true" is an exact cover problem: lines are
// the columns, clues the rows (covering every line they appear in). Knuth's
// Algorithm X (with the smallest-column heuristic) finds a cover; the culprit
// is the suspect selected in it.
const [L] = readline().split(" ").map(Number)
const clueId = new Map<string, number>()
const clueNames: string[] = []
const rowsCols: number[][] = [] // row (clue) -> columns (lines)
const lines: string[][] = []
for (let l = 0; l < L; l++) {
  const clues = [
    ...new Set(
      readline()
        .split(", ")
        .map(s => s.trim())
    ),
  ]
  lines.push(clues)
  for (const c of clues) {
    let id = clueId.get(c)
    if (id === undefined) {
      id = clueNames.length
      clueId.set(c, id)
      clueNames.push(c)
      rowsCols.push([])
    }
    rowsCols[id].push(l)
  }
}
// column (line) -> set of rows (clues) still available
const cols: Set<number>[] = lines.map(clues => new Set(clues.map(c => clueId.get(c)!)))
const activeCols = new Set<number>(cols.keys())

const select = (r: number): Set<number>[] => {
  const removed: Set<number>[] = []
  for (const j of rowsCols[r]) {
    for (const i of cols[j]) for (const k of rowsCols[i]) if (k !== j) cols[k].delete(i)
    activeCols.delete(j)
    removed.push(cols[j])
  }
  return removed
}
const deselect = (r: number, removed: Set<number>[]) => {
  const rc = rowsCols[r]
  for (let t = rc.length - 1; t >= 0; t--) {
    const j = rc[t]
    activeCols.add(j)
    for (const i of removed[t]) for (const k of rowsCols[i]) if (k !== j) cols[k].add(i)
  }
}

const solution: number[] = []
const solve = (): boolean => {
  if (activeCols.size === 0) return true
  let best = -1
  for (const j of activeCols) if (best < 0 || cols[j].size < cols[best].size) best = j
  if (cols[best].size === 0) return false
  for (const r of [...cols[best]]) {
    solution.push(r)
    const removed = select(r)
    if (solve()) return true
    deselect(r, removed)
    solution.pop()
  }
  return false
}
solve()

const suspects = new Set(lines[0])
console.log(solution.map(r => clueNames[r]).find(c => suspects.has(c)) ?? "")
