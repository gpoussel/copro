// 🎮 CodinGame Puzzle - how-many-roads-lead-to-rome
// https://www.codingame.com/training/medium/how-many-roads-lead-to-rome

const PARIS = 1
const ROME = 100

const edgeCount = parseInt(readline())
const adjacency: number[][] = []
for (let c = 0; c <= 100; c++) adjacency.push([])
for (let e = 0; e < edgeCount; e++) {
  const [a, b] = readline().trim().split(/\s+/).map(Number)
  if (a === b) continue
  if (adjacency[a].indexOf(b) < 0) adjacency[a].push(b)
  if (adjacency[b].indexOf(a) < 0) adjacency[b].push(a)
}

// Count simple paths from Paris to Rome with a backtracking DFS
const visitedCity: boolean[] = new Array(101).fill(false)
function countPaths(city: number): number {
  if (city === ROME) return 1
  visitedCity[city] = true
  let total = 0
  for (const next of adjacency[city]) if (!visitedCity[next]) total += countPaths(next)
  visitedCity[city] = false
  return total
}

console.log(countPaths(PARIS))
