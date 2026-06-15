// 🎮 CodinGame Puzzle - embedded-chessboards
// https://www.codingame.com/training/easy/embedded-chessboards

const n: number = parseInt(readline())
const out: string[] = []
for (let k = 0; k < n; k++) {
  const [row, col, isWhite] = readline().split(" ").map(Number)
  const A = row - 7
  const B = col - 7
  const t = (((row + col) % 2) + (isWhite ? 0 : 1)) % 2
  const evenI = Math.ceil(A / 2)
  const oddI = Math.floor(A / 2)
  const evenJ = Math.ceil(B / 2)
  const oddJ = Math.floor(B / 2)
  let count: number
  if (t === 0) {
    count = evenI * evenJ + oddI * oddJ
  } else {
    count = evenI * oddJ + oddI * evenJ
  }
  out.push(String(count))
}
console.log(out.join("\n"))
