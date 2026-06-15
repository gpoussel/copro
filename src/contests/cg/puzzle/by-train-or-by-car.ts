// 🎮 CodinGame Puzzle - by-train-or-by-car
// https://www.codingame.com/training/easy/by-train-or-by-car

const firstLine = readline().split(/\s+/)
const start = firstLine[0]
const dest = firstLine[1]
const N = parseInt(readline(), 10)

const adj = new Map<string, Array<{ to: string; d: number }>>()
function addEdge(a: string, b: string, d: number): void {
  if (!adj.has(a)) adj.set(a, [])
  if (!adj.has(b)) adj.set(b, [])
  adj.get(a)!.push({ to: b, d })
  adj.get(b)!.push({ to: a, d })
}

for (let i = 0; i < N; i++) {
  const tokens = readline().trim().split(/\s+/)
  addEdge(tokens[0], tokens[1], parseFloat(tokens[2]))
}

const visited = new Set<string>()
function dfs(node: string, accum: number[]): number[] | null {
  if (node === dest) return accum.slice()
  visited.add(node)
  for (const e of adj.get(node) || []) {
    if (visited.has(e.to)) continue
    accum.push(e.d)
    const res = dfs(e.to, accum)
    if (res) return res
    accum.pop()
  }
  return null
}
const segments = dfs(start, []) || []
const numIntermediate = segments.length - 1

// TRAIN: each segment has a 3 km slow zone at each end; if d<=6 the whole segment is slow.
let trainMin = 35 + 30 + numIntermediate * 8
for (const d of segments) {
  if (d <= 6) {
    trainMin += (d * 60) / 50
  } else {
    trainMin += (6 * 60) / 50 + ((d - 6) * 60) / 284
  }
}

// CAR: each segment has a 7 km slow zone at each end; if d<=14 the whole segment is slow.
let carMin = 0
for (const d of segments) {
  if (d <= 14) {
    carMin += (d * 60) / 50
  } else {
    carMin += (14 * 60) / 50 + ((d - 14) * 60) / 105
  }
}

function fmt(minutes: number): string {
  const total = Math.floor(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return h + ":" + (m < 10 ? "0" + m : "" + m)
}

if (trainMin <= carMin) {
  console.log("TRAIN " + fmt(trainMin))
} else {
  console.log("CAR " + fmt(carMin))
}
