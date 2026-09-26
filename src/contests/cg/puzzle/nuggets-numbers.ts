// 🎮 CodinGame Puzzle - nuggets-numbers
// https://www.codingame.com/training/hard/nuggets-numbers

// Frobenius number. If the gcd of the box sizes is not 1, infinitely many amounts are
// unreachable (-1). Otherwise, with m the smallest box, compute for every residue r mod m
// the smallest reachable amount d[r] (Dijkstra on residues); the answer is max(d) - m.

const n = parseInt(readline())
const boxes: number[] = []
for (let i = 0; i < n; i++) boxes.push(parseInt(readline()))

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
if (boxes.reduce(gcd) !== 1) {
  console.log(-1)
} else {
  const m = Math.min(...boxes)
  const dist = new Array<number>(m).fill(Infinity)
  const done = new Array<boolean>(m).fill(false)
  dist[0] = 0
  // m < 2000, so a simple O(m^2) Dijkstra is enough
  for (let iter = 0; iter < m; iter++) {
    let u = -1
    for (let r = 0; r < m; r++) if (!done[r] && (u < 0 || dist[r] < dist[u])) u = r
    if (dist[u] === Infinity) break
    done[u] = true
    for (const b of boxes) {
      const v = (u + b) % m
      if (dist[u] + b < dist[v]) dist[v] = dist[u] + b
    }
  }
  console.log(Math.max(...dist) - m)
}
