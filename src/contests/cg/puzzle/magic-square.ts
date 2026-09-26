// 🎮 CodinGame Puzzle - magic-square
// https://www.codingame.com/training/medium/magic-square

const sqSize = Number(readline())
const square: number[][] = []
for (let i = 0; i < sqSize; i++) square.push(readline().trim().split(/\s+/).map(Number))

function isMagic(): boolean {
  // Values must be exactly 1..n^2, each once
  const seen = new Set<number>()
  for (const row of square) {
    for (const v of row) {
      if (v < 1 || v > sqSize * sqSize || seen.has(v)) return false
      seen.add(v)
    }
  }
  const target = (sqSize * (sqSize * sqSize + 1)) / 2
  let diag1 = 0
  let diag2 = 0
  for (let i = 0; i < sqSize; i++) {
    let rowSum = 0
    let colSum = 0
    for (let j = 0; j < sqSize; j++) {
      rowSum += square[i][j]
      colSum += square[j][i]
    }
    if (rowSum !== target || colSum !== target) return false
    diag1 += square[i][i]
    diag2 += square[i][sqSize - 1 - i]
  }
  return diag1 === target && diag2 === target
}

console.log(isMagic() ? "MAGIC" : "MUGGLE")
