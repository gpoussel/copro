// 🎮 CodinGame Puzzle - apple-tree
// https://www.codingame.com/training/hard/apple-tree

const [N, idx] = readline().split(" ").map(Number)
interface Apple {
  x: number
  y: number
  z: number
  r: number
  fallen: boolean
}
const apples: Apple[] = []
for (let i = 0; i < N; i++) {
  const [x, y, z, r] = readline().split(" ").map(Number)
  apples.push({ x, y, z, r, fallen: false })
}

const queue: number[] = [idx]
apples[idx].fallen = true

while (queue.length > 0) {
  const fi = queue.shift() as number
  const f = apples[fi]
  for (let j = 0; j < N; j++) {
    const a = apples[j]
    if (a.fallen) continue
    if (a.z >= f.z) continue
    const dx = a.x - f.x
    const dy = a.y - f.y
    const rsum = a.r + f.r
    if (dx * dx + dy * dy <= rsum * rsum) {
      a.fallen = true
      queue.push(j)
    }
  }
}

let remaining = 0
for (const a of apples) if (!a.fallen) remaining++
console.log(remaining)
