// 🎮 CodinGame Puzzle - hourglass
// https://www.codingame.com/training/expert/hourglass

// The input layout of the grains does not matter, only how many are in each
// half. The canonical shape of each half depends only on its grain count, so
// both orders are precomputed: the order in which a full top half loses its
// 100 grains, and the order in which an empty bottom half receives them.
// After N seconds the top holds max(0, top - N) grains; the first removals are
// cleared from a full top, the first insertions are drawn in the bottom.
// Every grain sits in column 11 +/- offset.

const lines: string[] = []
for (let i = 0; i < 23; i++) lines.push(readline() ?? "")
const seconds = Number(readline())

const CENTER = 11
let topCount = 0
let total = 0
for (let i = 0; i < 23; i++) {
  for (const ch of lines[i]) {
    if (ch !== "o") continue
    total++
    if (i < 11) topCount++
  }
}

// Offsets from the center in the order grains leave / enter a line
const outOrder = (width: number): number[] => {
  const res = [0]
  for (let d = 1; res.length < width; d++) res.push(d, -d)
  return res
}

if (total !== 100) {
  console.log("BROKEN HOURGLASS")
} else {
  // Top half: line i (1..10) holds 21 - 2i grains
  const topRemoved: [number, number][] = [] // [line, column]
  const removedIn: number[] = new Array<number>(11).fill(0)
  const widthTop = (i: number): number => 21 - 2 * i
  const removeFrom = (i: number, k: number): void => {
    const order = outOrder(widthTop(i))
    for (let t = 0; t < k && removedIn[i] < order.length; t++) {
      topRemoved.push([i, CENTER + order[removedIn[i]]])
      removedIn[i]++
    }
  }
  while (topRemoved.length < 100) {
    let full = 1
    while (full <= 10 && removedIn[full] > 0) full++
    if (full <= 10) removeFrom(full, 1)
    for (let i = 1; i <= Math.min(full, 10); i++) removeFrom(i, 4)
  }

  // Bottom half: line 12 + j (j = 0..9) holds 2j + 1 grains
  const bottomAdded: [number, number][] = []
  for (let j = 0; j < 10; j++) bottomAdded.push([12 + j, CENTER])
  const addedIn: number[] = new Array<number>(10).fill(1)
  // insertion within a line: right, left, right, left...
  for (let round = 1; bottomAdded.length < 100; round++) {
    for (let j = 9; j > 9 - round; j--) {
      for (let t = 0; t < 2; t++) {
        const k = addedIn[j] // grains already in line j
        const off = k % 2 === 1 ? (k + 1) / 2 : -k / 2
        bottomAdded.push([12 + j, CENTER + off])
        addedIn[j]++
      }
    }
  }

  const leftTop = Math.max(0, topCount - seconds)
  const grid = lines.map(l => l.replace(/o/g, " ").split(""))
  const put = (r: number, c: number, ch: string): void => {
    while (grid[r].length <= c) grid[r].push(" ")
    grid[r][c] = ch
  }
  for (let i = 1; i <= 10; i++) for (let c = CENTER - (10 - i); c <= CENTER + (10 - i); c++) put(i, c, "o")
  for (let k = 0; k < 100 - leftTop; k++) {
    put(topRemoved[k][0], topRemoved[k][1], " ")
    put(bottomAdded[k][0], bottomAdded[k][1], "o")
  }
  console.log(grid.map(g => g.join("").trimEnd()).join("\n"))
}
