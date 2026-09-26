// 🎮 CodinGame Puzzle - virus-spreading-and-clustering
// https://www.codingame.com/training/medium/virus-spreading-and-clustering

const nPeople = parseInt(readline())
const nLinks = parseInt(readline())
const parent: number[] = []
const size: number[] = []
for (let i = 0; i < nPeople; i++) {
  parent.push(i)
  size.push(1)
}

const find = (x: number): number => {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

for (let i = 0; i < nLinks; i++) {
  const [a, b] = readline().trim().split(/\s+/).map(Number)
  const ra = find(a)
  const rb = find(b)
  if (ra === rb) continue
  parent[rb] = ra
  size[ra] += size[rb]
}

// Distribution of cluster sizes, largest first
const distribution = new Map<number, number>()
for (let i = 0; i < nPeople; i++) if (find(i) === i) distribution.set(size[i], (distribution.get(size[i]) || 0) + 1)
const sizes: number[] = []
distribution.forEach((_, s) => sizes.push(s))
sizes.sort((a, b) => b - a)
console.log(sizes.map(s => `${s} ${distribution.get(s)}`).join("\n"))
