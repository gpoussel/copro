// 🎮 CodinGame Puzzle - dwarfs-standing-on-the-shoulders-of-giants
// https://www.codingame.com/training/medium/dwarfs-standing-on-the-shoulders-of-giants

const n: number = parseInt(readline())
const adj: Map<number, number[]> = new Map()
const nodes: Set<number> = new Set()
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(" ").map(Number)
  if (!adj.has(x)) adj.set(x, [])
  adj.get(x)!.push(y)
  nodes.add(x)
  nodes.add(y)
}

const memo: Map<number, number> = new Map()
function longest(u: number): number {
  if (memo.has(u)) return memo.get(u)!
  let best = 1
  const next = adj.get(u)
  if (next) {
    for (const v of next) {
      best = Math.max(best, 1 + longest(v))
    }
  }
  memo.set(u, best)
  return best
}

let ans = 0
for (const u of nodes) {
  ans = Math.max(ans, longest(u))
}
console.log(ans)
