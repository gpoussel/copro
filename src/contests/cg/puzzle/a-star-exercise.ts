// 🎮 CodinGame Puzzle - a-star-exercise
// https://www.codingame.com/training/medium/a-star-exercise

const [n, e, start, goal] = readline().split(" ").map(Number)
const h = readline().split(" ").map(Number)
const adj: [number, number][][] = []
for (let i = 0; i < n; i++) adj.push([])
for (let i = 0; i < e; i++) {
  const [x, y, c] = readline().split(" ").map(Number)
  adj[x].push([y, c])
  adj[y].push([x, c])
}

const g: number[] = new Array(n).fill(Infinity)
const open: boolean[] = new Array(n).fill(false)
const closed: boolean[] = new Array(n).fill(false)
g[start] = 0
open[start] = true
const out: string[] = []
while (true) {
  // Pick the open node with the smallest f-value, then the smallest id
  let current = -1
  for (let v = 0; v < n; v++) {
    if (open[v] && (current < 0 || g[v] + h[v] < g[current] + h[current])) current = v
  }
  if (current < 0) break
  open[current] = false
  closed[current] = true
  out.push(`${current} ${g[current] + h[current]}`)
  if (current === goal) break
  for (const [next, cost] of adj[current]) {
    if (closed[next] || g[current] + cost >= g[next]) continue
    g[next] = g[current] + cost
    open[next] = true
  }
}
console.log(out.join("\n"))
