// 🎮 CodinGame Puzzle - polyominoes
// https://www.codingame.com/training/medium/polyominoes

// Accepted orientations of each piece (the referee only accepts these exact shapes)
const VARIANTS: { [id: string]: string[][] } = {
  A: [["O..", "OOO"], ["OO", "O.", "O."], ["OOO", "..O"], [".O", ".O", "OO"], ["..O", "OOO"], ["O.", "O.", "OO"], ["OOO", "O.."], ["OO", ".O", ".O"]],
  B: [["O.O", "OOO"], ["OO", "O.", "OO"], ["OOO", "O.O"], ["OO", ".O", "OO"]],
  C: [[".O.", "OOO", ".O."]],
  D: [[".O.", "OOO"], ["O.", "OO", "O."], ["OOO", ".O."], [".O", "OO", ".O"]],
  E: [[".O.", ".O.", "OOO"], ["O..", "OOO", "O.."], ["OOO", ".O.", ".O."], ["..O", "OOO", "..O"]],
  F: [["OOOO"], ["O", "O", "O", "O"]],
  G: [["OO.", ".OO", "..O"], ["..O", ".OO", "OO."], ["O..", "OO.", ".OO"], [".OO", "OO.", "O.."]],
  H: [[".O", "OO"], ["O.", "OO"], ["OO", "O."], ["OO", ".O"]],
  I: [["OO", ".O", "OO", "O."], ["OO.O", ".OOO"], [".O", "OO", "O.", "OO"], ["OOO.", "O.OO"], ["OO", "O.", "OO", ".O"], [".OOO", "OO.O"], ["O.", "OO", ".O", "OO"], ["O.OO", "OOO."]],
  J: [["OOO", "..O", "..O"], ["..O", "..O", "OOO"], ["O..", "O..", "OOO"], ["OOO", "O..", "O.."]],
  K: [["OO", "OO"]],
  L: [[".OO", ".O.", "OO."], ["O..", "OOO", "..O"], ["OO.", ".O.", ".OO"], ["..O", "OOO", "O.."]],
  M: [[".OO", "OO."], ["O.", "OO", ".O"], ["OO.", ".OO"], [".O", "OO", "O."]],
  N: [["OOO", "OO."], ["OO", "OO", ".O"], [".OO", "OOO"], ["O.", "OO", "OO"], ["OOO", ".OO"], [".O", "OO", "OO"], ["OO.", "OOO"], ["OO", "OO", "O."]],
}

// Cells of a shape relative to its first cell in reading order
const offsets = (shape: string[]): [number, number][] => {
  const cells: [number, number][] = []
  shape.forEach((row, r) => row.split("").forEach((ch, c) => ch === "O" && cells.push([r, c])))
  const [r0, c0] = cells[0]
  return cells.map(([r, c]) => [r - r0, c - c0] as [number, number])
}

// Input: piece ids, then board size and rows (tolerate board-first order too)
const first = readline().trim()
let ids: string
let sizeLine: string
if (/^\d+\s+\d+$/.test(first)) {
  sizeLine = first
  ids = ""
} else {
  ids = first
  sizeLine = readline().trim()
}
const [h, w] = sizeLine.split(/\s+/).map(Number)
const board: string[][] = []
for (let i = 0; i < h; i++) board.push(readline().split(""))
if (ids === "") ids = readline().trim()

const pieces = ids.split("")
const shapes = pieces.map(id => VARIANTS[id].map(offsets))
const used = pieces.map(() => false)

const solve = (): boolean => {
  // First cell to cover in reading order
  let tr = -1
  let tc = -1
  for (let r = 0; r < h && tr < 0; r++) {
    for (let c = 0; c < w; c++) {
      if (board[r][c] === "O") {
        tr = r
        tc = c
        break
      }
    }
  }
  if (tr < 0) return used.every(u => u)
  for (let p = 0; p < pieces.length; p++) {
    if (used[p]) continue
    for (const cells of shapes[p]) {
      const fits = cells.every(([dr, dc]) => {
        const r = tr + dr
        const c = tc + dc
        return r >= 0 && r < h && c >= 0 && c < w && board[r][c] === "O"
      })
      if (!fits) continue
      for (const [dr, dc] of cells) board[tr + dr][tc + dc] = pieces[p]
      used[p] = true
      if (solve()) return true
      used[p] = false
      for (const [dr, dc] of cells) board[tr + dr][tc + dc] = "O"
    }
  }
  return false
}

solve()
for (const row of board) console.log(row.join(""))
