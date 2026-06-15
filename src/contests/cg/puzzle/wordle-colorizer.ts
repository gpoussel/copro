// 🎮 CodinGame Puzzle - wordle-colorizer
// https://www.codingame.com/training/easy/wordle-colorizer

const answer = readline()
const n = parseInt(readline(), 10)
for (let k = 0; k < n; k++) {
  const attempt = readline()
  const res: string[] = new Array(5).fill("X")
  const counts: Record<string, number> = {}
  for (const ch of answer) counts[ch] = (counts[ch] ?? 0) + 1
  for (let i = 0; i < 5; i++) {
    if (attempt[i] === answer[i]) {
      res[i] = "#"
      counts[attempt[i]]--
    }
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "#") continue
    const c = attempt[i]
    if ((counts[c] ?? 0) > 0) {
      res[i] = "O"
      counts[c]--
    }
  }
  console.log(res.join(""))
}
