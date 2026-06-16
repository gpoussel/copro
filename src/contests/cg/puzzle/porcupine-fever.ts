// 🎮 CodinGame Puzzle - porcupine-fever
// https://www.codingame.com/training/medium/porcupine-fever

const N = parseInt(readline(), 10)
const Y = parseInt(readline(), 10)
const cages: { sick: number; healthy: number }[] = []
for (let i = 0; i < N; i++) {
  const [s, h] = readline().split(" ").map(Number)
  cages.push({ sick: s, healthy: h })
}

const out: string[] = []
for (let y = 0; y < Y; y++) {
  let total = 0
  for (const c of cages) {
    const newSick = Math.min(c.healthy, 2 * c.sick)
    c.healthy -= newSick
    c.sick = newSick
    total += c.sick + c.healthy
  }
  out.push(String(total))
  if (total === 0) break
}
console.log(out.join("\n"))
