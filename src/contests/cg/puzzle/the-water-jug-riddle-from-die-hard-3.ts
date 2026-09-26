// 🎮 CodinGame Puzzle - the-water-jug-riddle-from-die-hard-3
// https://www.codingame.com/training/expert/the-water-jug-riddle-from-die-hard-3

// Plain BFS over jug contents. A state is encoded in mixed radix (capacity+1
// per jug); moves are fill, empty and pour between any two jugs. Only
// reachable states are visited (at least one jug is always full or empty), so
// a Set of seen keys is enough.

const target = Number(readline())
const jugCount = Number(readline())
const caps: number[] = []
for (let i = 0; i < jugCount; i++) caps.push(Number(readline()))

const radix: number[] = []
let mul = 1
for (const c of caps) {
  radix.push(mul)
  mul *= c + 1
}

const solve = (): number => {
  if (caps.includes(target)) return 1
  const seen = new Set<number>([0])
  let frontier: number[] = [0]
  const v: number[] = new Array<number>(jugCount).fill(0)
  let depth = 0
  while (frontier.length) {
    depth++
    const next: number[] = []
    let found = false
    // Registers a new neighbour, flagging it when a changed jug holds the target
    const visit = (k: number, changed1: number, changed2: number): void => {
      if (seen.has(k)) return
      if (changed1 === target || changed2 === target) found = true
      seen.add(k)
      next.push(k)
    }
    for (const key of frontier) {
      for (let i = 0; i < jugCount; i++) v[i] = Math.floor(key / radix[i]) % (caps[i] + 1)
      for (let i = 0; i < jugCount; i++) {
        if (v[i] < caps[i]) visit(key + (caps[i] - v[i]) * radix[i], caps[i], -1)
        if (v[i] === 0) continue
        visit(key - v[i] * radix[i], 0, -1)
        for (let j = 0; j < jugCount; j++) {
          if (j === i || v[j] === caps[j]) continue
          const amount = Math.min(v[i], caps[j] - v[j])
          visit(key - amount * radix[i] + amount * radix[j], v[i] - amount, v[j] + amount)
        }
      }
      if (found) return depth
    }
    frontier = next
  }
  return -1
}

console.log(solve())
