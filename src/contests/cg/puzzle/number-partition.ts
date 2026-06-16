// 🎮 CodinGame Puzzle - number-partition
// https://www.codingame.com/training/easy/number-partition

const n: number = parseInt(readline(), 10)
const out: string[] = []

const partition = (remaining: number, max: number, current: number[]): void => {
  if (remaining === 0) {
    out.push(current.join(" "))
    return
  }
  for (let i = Math.min(max, remaining); i >= 1; i--) {
    current.push(i)
    partition(remaining - i, i, current)
    current.pop()
  }
}

partition(n, n, [])
console.log(out.join("\n"))
