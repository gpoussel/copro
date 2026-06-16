// 🎮 CodinGame Puzzle - by-train-or-by-car
// https://www.codingame.com/training/easy/by-train-or-by-car

const firstLine: string = readline()
const [start, dest]: string[] = firstLine.split(" ")
const n: number = parseInt(readline(), 10)

const adj: Map<string, Array<{ city: string; dist: number }>> = new Map()
const addEdge = (a: string, b: string, d: number): void => {
  if (!adj.has(a)) adj.set(a, [])
  adj.get(a)!.push({ city: b, dist: d })
}

for (let i = 0; i < n; i++) {
  const parts: string[] = readline().trim().split(/\s+/)
  const c1: string = parts[0]
  const c2: string = parts[1]
  const d: number = parseFloat(parts[2])
  addEdge(c1, c2, d)
  addEdge(c2, c1, d)
}

// Find the path from start to dest (unique, no loops).
const path: string[] = []
const dists: number[] = []
const visited: Set<string> = new Set()

const dfs = (city: string): boolean => {
  if (city === dest) {
    path.push(city)
    return true
  }
  visited.add(city)
  const neighbors = adj.get(city) || []
  for (const next of neighbors) {
    if (visited.has(next.city)) continue
    if (dfs(next.city)) {
      path.unshift(city)
      dists.unshift(next.dist)
      return true
    }
  }
  return false
}

dfs(start)

// Compute train time (minutes).
// 35 min home->station, 30 min station->dest.
// Slow zone (50 km/h) for 3 km before and after each city.
// Intermediate cities also have an 8 min pause.
// Each segment d: 3 km slow at the departure city side + 3 km slow at arrival
// city side + (d-6) km at 284 km/h. Pause counted once per intermediate stop.
let trainTime = 35 + 30
for (let i = 0; i < dists.length; i++) {
  const d = dists[i]
  const slow = Math.min(d, 6) // 3 km each side, capped at segment length
  trainTime += (slow * 60) / 50
  trainTime += ((d - slow) * 60) / 284
}
// Pause at each intermediate stop (not start, not destination).
const intermediateStops = path.length - 2
trainTime += 8 * Math.max(0, intermediateStops)

// Compute car time (minutes).
// Slow zone (50 km/h) for 7 km before and after each city.
let carTime = 0
for (let i = 0; i < dists.length; i++) {
  const d = dists[i]
  const slow = Math.min(d, 14) // 7 km each side, capped at segment length
  carTime += (slow * 60) / 50
  carTime += ((d - slow) * 60) / 105
}

const fmt = (minutes: number): string => {
  const total = Math.floor(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}:${m.toString().padStart(2, "0")}`
}

if (carTime < trainTime) {
  console.log(`CAR ${fmt(carTime)}`)
} else {
  console.log(`TRAIN ${fmt(trainTime)}`)
}
