// 🎮 CodinGame Puzzle - ye_-an_th_r-w_rd-se_rch
// https://www.codingame.com/training/medium/ye_-an_th_r-w_rd-se_rch

const [wsHeight, wsWidth] = readline().split(" ").map(Number)
const wsGrid: string[] = []
for (let i = 0; i < wsHeight; i++) wsGrid.push(readline())
const wsWords = readline()
  .split(" ")
  .filter(w => w.length > 0)

const DIRS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

// Every placement is the list of cell indices covered by the word
const candidates: number[][][] = wsWords.map(word => {
  const list: number[][] = []
  for (let r = 0; r < wsHeight; r++) {
    for (let c = 0; c < wsWidth; c++) {
      for (const [dr, dc] of DIRS) {
        const er = r + dr * (word.length - 1)
        const ec = c + dc * (word.length - 1)
        if (er < 0 || er >= wsHeight || ec < 0 || ec >= wsWidth) continue
        const cells: number[] = []
        let ok = true
        for (let k = 0; k < word.length && ok; k++) {
          const ch = wsGrid[r + dr * k][c + dc * k]
          if (ch !== "." && ch !== word[k]) ok = false
          cells.push((r + dr * k) * wsWidth + c + dc * k)
        }
        if (ok) list.push(cells)
      }
    }
  }
  return list
})

// Assigned letter per cell + number of words using the cell
const assigned: string[] = new Array(wsHeight * wsWidth).fill("")
const usage: number[] = new Array(wsHeight * wsWidth).fill(0)
const placed: boolean[] = wsWords.map(() => false)

function fits(w: number, cells: number[]): boolean {
  const word = wsWords[w]
  for (let k = 0; k < cells.length; k++) {
    const a = assigned[cells[k]]
    if (a !== "" && a !== word[k]) return false
  }
  return true
}

function search(remaining: number): boolean {
  if (remaining === 0) return true
  let best = -1
  let bestOptions: number[][] = []
  for (let w = 0; w < wsWords.length; w++) {
    if (placed[w]) continue
    const options = candidates[w].filter(cells => fits(w, cells))
    if (best === -1 || options.length < bestOptions.length) {
      best = w
      bestOptions = options
      if (options.length === 0) return false
    }
  }
  placed[best] = true
  const word = wsWords[best]
  for (const cells of bestOptions) {
    for (let k = 0; k < cells.length; k++) {
      assigned[cells[k]] = word[k]
      usage[cells[k]]++
    }
    if (search(remaining - 1)) return true
    for (const cell of cells) {
      if (--usage[cell] === 0) assigned[cell] = ""
    }
  }
  placed[best] = false
  return false
}

search(wsWords.length)

for (let r = 0; r < wsHeight; r++) {
  let line = ""
  for (let c = 0; c < wsWidth; c++) {
    const a = assigned[r * wsWidth + c]
    line += a === "" ? " " : a
  }
  console.log(line)
}
