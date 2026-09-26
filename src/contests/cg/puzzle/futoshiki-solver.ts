// 🎮 CodinGame Puzzle - futoshiki-solver
// https://www.codingame.com/training/medium/futoshiki-solver

const lineCount = Number(readline())
const lines: string[] = []
for (let i = 0; i < lineCount; i++) lines.push(readline())
const fn = (lineCount + 1) / 2
const at = (r: number, c: number): string => lines[r].charAt(c) || " "

const cells: number[] = []
// greaterCells[i] / lesserCells[i]: cells whose value must be greater / smaller than cell i's
const greaterCells: number[][] = []
const lesserCells: number[][] = []
for (let i = 0; i < fn * fn; i++) {
  greaterCells.push([])
  lesserCells.push([])
}
const addLess = (a: number, b: number) => {
  greaterCells[a].push(b)
  lesserCells[b].push(a)
}
for (let r = 0; r < fn; r++) {
  for (let c = 0; c < fn; c++) {
    const id = r * fn + c
    cells.push(Number(at(2 * r, 2 * c)))
    if (c + 1 < fn) {
      const h = at(2 * r, 2 * c + 1)
      if (h === "<") addLess(id, id + 1)
      if (h === ">") addLess(id + 1, id)
    }
    if (r + 1 < fn) {
      const v = at(2 * r + 1, 2 * c)
      if (v === "^") addLess(id, id + fn)
      if (v === "v") addLess(id + fn, id)
    }
  }
}

function canPlace(id: number, v: number): boolean {
  const r = Math.floor(id / fn)
  const c = id % fn
  for (let k = 0; k < fn; k++) {
    if (k !== c && cells[r * fn + k] === v) return false
    if (k !== r && cells[k * fn + c] === v) return false
  }
  for (const g of greaterCells[id]) if (cells[g] && cells[g] <= v) return false
  for (const l of lesserCells[id]) if (cells[l] && cells[l] >= v) return false
  return true
}

function solve(id: number): boolean {
  if (id === fn * fn) return true
  if (cells[id]) return solve(id + 1)
  for (let v = 1; v <= fn; v++) {
    if (!canPlace(id, v)) continue
    cells[id] = v
    if (solve(id + 1)) return true
  }
  cells[id] = 0
  return false
}

solve(0)
for (let r = 0; r < fn; r++) console.log(cells.slice(r * fn, (r + 1) * fn).join(""))
