// 🎮 CodinGame Puzzle - 10-pin-bowling-scores
// https://www.codingame.com/training/easy/10-pin-bowling-scores

const N = parseInt(readline())
const out: string[] = []
for (let g = 0; g < N; g++) {
  const frames = readline().split(" ")
  // Flatten every roll into pin values (handling X, /, -, digits).
  const rolls: number[] = []
  for (const f of frames) {
    let prev = 0
    for (const ch of f) {
      let v: number
      if (ch === "X") v = 10
      else if (ch === "-") v = 0
      else if (ch === "/") v = 10 - prev
      else v = parseInt(ch)
      rolls.push(v)
      prev = v
    }
  }
  const cum: number[] = []
  let total = 0
  let i = 0
  for (let frame = 0; frame < 10; frame++) {
    if (rolls[i] === 10) {
      total += 10 + (rolls[i + 1] ?? 0) + (rolls[i + 2] ?? 0)
      i += 1
    } else if (rolls[i] + rolls[i + 1] === 10) {
      total += 10 + (rolls[i + 2] ?? 0)
      i += 2
    } else {
      total += rolls[i] + rolls[i + 1]
      i += 2
    }
    cum.push(total)
  }
  out.push(cum.join(" "))
}
console.log(out.join("\n"))
