// 🎮 CodinGame Puzzle - n-dimensional-maze
// https://www.codingame.com/training/medium/n-dimensional-maze

const n = parseInt(readline())
const parse = (s: string) => s.split(",").map(Number)
const size = parse(readline())
const start = parse(readline())
const dest = parse(readline())
const b = parseInt(readline())

// Flatten the n-dimensional grid into a 1D array using strides
const stride: number[] = []
let total = 1
for (let d = 0; d < n; d++) {
  stride.push(total)
  total *= size[d]
}
const toIndex = (p: number[]) => p.reduce((acc, v, d) => acc + v * stride[d], 0)

const blocked = new Uint8Array(total)
for (let i = 0; i < b; i++) {
  const [lo, hi] = readline().split(" ").map(parse)
  // Enumerate every cell of the hyperrectangle, odometer style
  const cur = lo.slice()
  while (true) {
    blocked[toIndex(cur)] = 1
    let d = 0
    while (d < n && cur[d] === hi[d]) {
      cur[d] = lo[d]
      d++
    }
    if (d === n) break
    cur[d]++
  }
}

const dist = new Int32Array(total).fill(-1)
const queue = new Int32Array(total)
const src = toIndex(start)
const dst = toIndex(dest)
dist[src] = 0
queue[0] = src
let head = 0
let tail = 1
while (head < tail && dist[dst] < 0) {
  const cell = queue[head++]
  for (let d = 0; d < n; d++) {
    const coord = Math.floor(cell / stride[d]) % size[d]
    for (const delta of [-1, 1]) {
      const c = coord + delta
      if (c < 0 || c >= size[d]) continue
      const next = cell + delta * stride[d]
      if (blocked[next] || dist[next] >= 0) continue
      dist[next] = dist[cell] + 1
      queue[tail++] = next
    }
  }
}

console.log(dist[dst] < 0 ? "NO PATH" : String(dist[dst]))
