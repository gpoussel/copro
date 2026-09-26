// 🎮 CodinGame Puzzle - ddcg-mapper
// https://www.codingame.com/training/medium/ddcg-mapper

const L = parseInt(readline())
const N = parseInt(readline())
const patterns: { pattern: string; tempo: number }[] = []
for (let i = 0; i < N; i++) {
  const [pattern, tempo] = readline().split(" ")
  patterns.push({ pattern, tempo: parseInt(tempo) })
}

// Line i (1-based, counted from the bottom) gets every pattern whose tempo divides i
for (let i = L; i >= 1; i--) {
  const line = ["0", "0", "0", "0"]
  for (const { pattern, tempo } of patterns) {
    if (i % tempo !== 0) continue
    for (let k = 0; k < 4; k++) if (pattern[k] === "X") line[k] = "X"
  }
  console.log(line.join(""))
}
