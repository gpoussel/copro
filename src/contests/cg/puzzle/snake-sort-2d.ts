// 🎮 CodinGame Puzzle - snake-sort-2d
// https://www.codingame.com/training/snake-sort-2d

const n = parseInt(readline())
type Apple = { name: string; r: number; c: number }
const apples: Apple[] = []
for (let i = 0; i < n; i++) {
  const parts = readline().split(" ")
  apples.push({ name: parts[0], r: parseInt(parts[1]), c: parseInt(parts[2]) })
}

const byRow = new Map<number, Apple[]>()
for (const a of apples) {
  if (!byRow.has(a.r)) byRow.set(a.r, [])
  byRow.get(a.r)!.push(a)
}

const rows = [...byRow.keys()].sort((a, b) => a - b)
const result: string[] = []
let leftToRight = true
for (const row of rows) {
  const list = byRow.get(row)!
  list.sort((a, b) => (leftToRight ? a.c - b.c : b.c - a.c))
  for (const a of list) result.push(a.name)
  leftToRight = !leftToRight
}

console.log(result.join(","))
