// 🎮 CodinGame Puzzle - wordle-colorizer
// https://www.codingame.com/

const answer: string = readline()
const n: number = parseInt(readline(), 10)
for (let i = 0; i < n; i++) {
  const attempt: string = readline()
  const result: string[] = new Array<string>(5).fill("X")
  const counts: Map<string, number> = new Map<string, number>()
  for (const c of answer) {
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  for (let j = 0; j < 5; j++) {
    if (attempt[j] === answer[j]) {
      result[j] = "#"
      counts.set(attempt[j], (counts.get(attempt[j]) ?? 0) - 1)
    }
  }
  for (let j = 0; j < 5; j++) {
    if (result[j] === "#") {
      continue
    }
    const c: string = attempt[j]
    const remaining: number = counts.get(c) ?? 0
    if (remaining > 0) {
      result[j] = "O"
      counts.set(c, remaining - 1)
    }
  }
  console.log(result.join(""))
}
