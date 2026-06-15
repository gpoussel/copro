// 🎮 CodinGame Puzzle - character-replacement-problem
// https://www.codingame.com/

const s: string = readline()
const n: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < n; i++) {
  grid.push(readline())
}

const map: Map<string, string> = new Map()
let error = false

for (const pair of s.split(" ")) {
  if (pair.length !== 2) continue
  const from: string = pair[0]
  const to: string = pair[1]
  if (from === to) continue
  const existing = map.get(from)
  if (existing !== undefined && existing !== to) {
    error = true
    break
  }
  map.set(from, to)
}

const resolved: Map<string, string> = new Map()

function resolve(c: string): string {
  const visited: Set<string> = new Set()
  let cur: string = c
  while (map.has(cur)) {
    if (visited.has(cur)) {
      error = true
      return cur
    }
    visited.add(cur)
    cur = map.get(cur) as string
  }
  return cur
}

if (!error) {
  for (const c of map.keys()) {
    const r = resolve(c)
    if (error) break
    resolved.set(c, r)
  }
}

if (error) {
  console.log("ERROR")
} else {
  const out: string[] = grid.map(line =>
    line
      .split("")
      .map(ch => resolved.get(ch) ?? ch)
      .join("")
  )
  console.log(out.join("\n"))
}
