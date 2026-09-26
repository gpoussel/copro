// 🎮 CodinGame Puzzle - shikaku-solver
// https://www.codingame.com/training/medium/shikaku-solver

const [gridW, gridH] = readline().split(" ").map(Number)
const clues: number[][] = []
for (let r = 0; r < gridH; r++) clues.push(readline().trim().split(/\s+/).map(Number))

interface Rect {
  top: number
  left: number
  height: number
  width: number
  clue: number
}

// Enumerate, for every clue, the rectangles of the right area containing only that clue
const clueCells: [number, number][] = []
for (let r = 0; r < gridH; r++) for (let c = 0; c < gridW; c++) if (clues[r][c] > 0) clueCells.push([r, c])
const candidates: Rect[][] = clueCells.map(() => [])
const byTopLeft: Rect[][] = []
for (let i = 0; i < gridW * gridH; i++) byTopLeft.push([])

// Prefix sums of clue counts, to check that a rectangle contains a single clue
const prefix: number[][] = []
for (let r = 0; r <= gridH; r++) {
  prefix.push([])
  for (let c = 0; c <= gridW; c++) {
    prefix[r].push(r === 0 || c === 0 ? 0 : prefix[r - 1][c] + prefix[r][c - 1] - prefix[r - 1][c - 1] + (clues[r - 1][c - 1] > 0 ? 1 : 0))
  }
}
const clueCount = (top: number, left: number, h: number, w: number): number =>
  prefix[top + h][left + w] - prefix[top][left + w] - prefix[top + h][left] + prefix[top][left]

clueCells.forEach(([cr, cc], idx) => {
  const area = clues[cr][cc]
  for (let h = 1; h <= area; h++) {
    if (area % h !== 0) continue
    const w = area / h
    for (let top = cr - h + 1; top <= cr; top++) {
      for (let left = cc - w + 1; left <= cc; left++) {
        if (top < 0 || left < 0 || top + h > gridH || left + w > gridW) continue
        if (clueCount(top, left, h, w) !== 1) continue
        const rect: Rect = { top, left, height: h, width: w, clue: idx }
        candidates[idx].push(rect)
        byTopLeft[top * gridW + left].push(rect)
      }
    }
  }
})

const owner: number[] = []
for (let i = 0; i < gridW * gridH; i++) owner.push(-1)
const used: boolean[] = clueCells.map(() => false)

const isFree = (rect: Rect): boolean => {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) if (owner[r * gridW + c] >= 0) return false
  }
  return true
}
const paint = (rect: Rect, value: number): void => {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) owner[r * gridW + c] = value
  }
}

// Forward check: every clue still to place needs at least one free candidate
const allCluesPlaceable = (): boolean => {
  for (let i = 0; i < clueCells.length; i++) {
    if (used[i]) continue
    let ok = false
    for (const rect of candidates[i]) {
      if (isFree(rect)) {
        ok = true
        break
      }
    }
    if (!ok) return false
  }
  return true
}

const letterFor = (k: number): string => String.fromCharCode(k < 26 ? 65 + k : 97 + k - 26)

let solutionCount = 0
let bestSolution = ""
const labelGrid: string[] = []
for (let i = 0; i < gridW * gridH; i++) labelGrid.push("")

// Rectangles are placed in order of their top-left corner, so the k-th placed one gets the k-th letter
const search = (start: number, placed: number): void => {
  let cell = start
  while (cell < gridW * gridH && owner[cell] >= 0) cell++
  if (cell === gridW * gridH) {
    solutionCount++
    const text = labelGrid.join("")
    if (bestSolution === "" || text < bestSolution) bestSolution = text
    return
  }
  for (const rect of byTopLeft[cell]) {
    if (used[rect.clue] || !isFree(rect)) continue
    used[rect.clue] = true
    paint(rect, rect.clue)
    const letter = letterFor(placed)
    for (let r = rect.top; r < rect.top + rect.height; r++) {
      for (let c = rect.left; c < rect.left + rect.width; c++) labelGrid[r * gridW + c] = letter
    }
    if (allCluesPlaceable()) search(cell + 1, placed + 1)
    paint(rect, -1)
    used[rect.clue] = false
  }
}

search(0, 0)
console.log(solutionCount)
for (let r = 0; r < gridH; r++) console.log(bestSolution.substr(r * gridW, gridW))
