// 🎮 CodinGame Puzzle - production-pipeline
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const k: number = parseInt(readline(), 10)

const adj: Set<number>[] = Array.from({ length: n + 1 }, () => new Set<number>())
const indeg: number[] = new Array<number>(n + 1).fill(0)
let selfLoop: boolean = false

for (let i = 0; i < k; i++) {
  const parts: number[] = readline()
    .split("<")
    .map(s => parseInt(s, 10))
  const p1: number = parts[0]
  const p2: number = parts[1]
  if (p1 === p2) {
    selfLoop = true
  } else if (!adj[p1].has(p2)) {
    adj[p1].add(p2)
    indeg[p2]++
  }
}

const ready: number[] = []
for (let v = 1; v <= n; v++) {
  if (indeg[v] === 0) {
    ready.push(v)
  }
}

const order: number[] = []
while (ready.length > 0) {
  let minIdx: number = 0
  for (let i = 1; i < ready.length; i++) {
    if (ready[i] < ready[minIdx]) {
      minIdx = i
    }
  }
  const u: number = ready[minIdx]
  ready[minIdx] = ready[ready.length - 1]
  ready.pop()
  order.push(u)
  for (const w of adj[u]) {
    indeg[w]--
    if (indeg[w] === 0) {
      ready.push(w)
    }
  }
}

if (selfLoop || order.length < n) {
  console.log("INVALID")
} else {
  console.log(order.join(" "))
}
