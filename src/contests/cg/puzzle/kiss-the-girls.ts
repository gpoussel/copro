// 🎮 CodinGame Puzzle - kiss-the-girls
// https://www.codingame.com/training/easy/kiss-the-girls

const [h] = (readline().split(" ") as string[]).map(Number)
const risks: number[] = []
for (let y = 0; y < h; y++) {
  const row: string = readline()
  for (let x = 0; x < row.length; x++) {
    if (row[x] === "G") {
      risks.push(Math.min(x, y) / (x * x + y * y + 1))
    }
  }
}
risks.sort((a, b) => a - b)
let safe = 1
let count = 0
for (const p of risks) {
  const next: number = safe * (1 - p)
  if (1 - next <= 0.4) {
    safe = next
    count++
  } else {
    break
  }
}
console.log(count)
