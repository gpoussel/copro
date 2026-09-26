// 🎮 CodinGame Puzzle - counting-squares-on-pegs
// https://www.codingame.com/training/medium/counting-squares-on-pegs

const pegCount = parseInt(readline())
const px: number[] = []
const py: number[] = []
const occupied = new Uint8Array(pegCount * pegCount)
for (let i = 0; i < pegCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  px.push(x)
  py.push(y)
  occupied[x * pegCount + y] = 1
}

const hasPeg = (x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < pegCount && y < pegCount && occupied[x * pegCount + y] === 1

// For each ordered pair (a, b) build the square on its left side: each square is seen 4 times
let squares = 0
for (let a = 0; a < pegCount; a++) {
  for (let b = 0; b < pegCount; b++) {
    if (a === b) continue
    const dx = px[b] - px[a]
    const dy = py[b] - py[a]
    if (hasPeg(px[a] - dy, py[a] + dx) && hasPeg(px[b] - dy, py[b] + dx)) squares++
  }
}
console.log(squares / 4)
