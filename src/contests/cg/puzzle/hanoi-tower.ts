// 🎮 CodinGame Puzzle - hanoi-tower
// https://www.codingame.com/training/hard/hanoi-tower

// Simulate the iterative algorithm: odd turns move the smallest disk
// cyclically (right if N even, left if N odd), even turns make the only
// other legal move. Total number of turns is 2^N - 1.
const N = parseInt(readline())
const T = parseInt(readline())

const pegs: number[][] = [[], [], []]
for (let d = N; d >= 1; d--) pegs[0].push(d)
const top = (p: number): number => (pegs[p].length ? pegs[p][pegs[p].length - 1] : Infinity)

const step = N % 2 === 0 ? 1 : 2
let small = 0
for (let t = 1; t <= T; t++) {
  if (t % 2 === 1) {
    const to = (small + step) % 3
    pegs[to].push(pegs[small].pop() as number)
    small = to
  } else {
    const a = (small + 1) % 3
    const b = (small + 2) % 3
    if (top(a) < top(b)) pegs[b].push(pegs[a].pop() as number)
    else pegs[a].push(pegs[b].pop() as number)
  }
}

const lines: string[] = []
for (let level = N - 1; level >= 0; level--) {
  const parts = pegs.map(p => {
    const d = p[level]
    if (d === undefined) return " ".repeat(N) + "|" + " ".repeat(N)
    return " ".repeat(N - d) + "#".repeat(2 * d + 1) + " ".repeat(N - d)
  })
  lines.push(parts.join(" ").trimEnd())
}
console.log(lines.join("\n"))
console.log(2 ** N - 1)
