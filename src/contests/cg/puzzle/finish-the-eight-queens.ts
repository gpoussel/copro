// 🎮 CodinGame Puzzle - finish-the-eight-queens
// https://www.codingame.com/training/medium/finish-the-eight-queens

// queenCol[r] = column of the queen in row r, or -1 when still free
const queenCol: number[] = []
for (let r = 0; r < 8; r++) queenCol.push(readline().indexOf("Q"))

function isSafe(r: number, c: number): boolean {
  for (let o = 0; o < 8; o++) {
    const oc = queenCol[o]
    if (o === r || oc < 0) continue
    if (oc === c || Math.abs(oc - c) === Math.abs(o - r)) return false
  }
  return true
}

function place(r: number): boolean {
  if (r === 8) return true
  if (queenCol[r] >= 0) return isSafe(r, queenCol[r]) && place(r + 1)
  for (let c = 0; c < 8; c++) {
    if (!isSafe(r, c)) continue
    queenCol[r] = c
    if (place(r + 1)) return true
    queenCol[r] = -1
  }
  return false
}

place(0)
for (let r = 0; r < 8; r++) {
  let line = ""
  for (let c = 0; c < 8; c++) line += queenCol[r] === c ? "Q" : "."
  console.log(line)
}
