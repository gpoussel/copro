// 🎮 CodinGame Puzzle - frog-exchange
// https://www.codingame.com/training/medium/frog-exchange

// Depth-first search over jump sequences, trying female moves before male
// moves ("start with the ladies") and backtracking out of deadlocks
const initialStones = readline().trim().split(" ")
const stoneCount = initialStones.length
const half = (stoneCount - 1) / 2
// Frogs of the kind on the left look right, the other ones look left
const leftKind = initialStones[0]
const rightKind = leftKind === "m" ? "f" : "m"

const targetStones: string[] = []
for (let i = 0; i < stoneCount; i++) targetStones.push(i < half ? rightKind : i > half ? leftKind : "s")
const targetKey = targetStones.join(" ")

function directionOf(kind: string): number {
  return kind === leftKind ? 1 : -1
}

const deadStates: { [key: string]: boolean } = {}
const path: string[] = []

function solve(stones: string[]): boolean {
  const key = stones.join(" ")
  path.push(key)
  if (key === targetKey) return true
  if (deadStates[key]) {
    path.pop()
    return false
  }
  for (const kind of ["f", "m"]) {
    const dir = directionOf(kind)
    for (let i = 0; i < stoneCount; i++) {
      if (stones[i] !== kind) continue
      for (const distance of [1, 2]) {
        const to = i + dir * distance
        if (to < 0 || to >= stoneCount || stones[to] !== "s") continue
        if (distance === 2 && stones[i + dir] === "s") continue
        const next = stones.slice()
        next[to] = kind
        next[i] = "s"
        if (solve(next)) return true
      }
    }
  }
  deadStates[key] = true
  path.pop()
  return false
}

if (stoneCount === 1 || initialStones.join(" ") === targetKey) console.log(initialStones.join(" "))
else {
  solve(initialStones)
  console.log(path.join("\n"))
}
