// 🎮 CodinGame Puzzle - chebyshev-orbiting
// https://www.codingame.com/training/medium/chebyshev-orbiting

const [radius, x0, y0, vx0, vy0, duration] = readline().split(" ").map(Number)

let x = x0
let y = y0
let vx = vx0
let vy = vy0
let crashed = false
// Each axis is a bounded oscillator, so the state eventually cycles
const seenAt = new Map<string, number>()
const history: [number, number][] = []

for (let t = 0; t < duration; t++) {
  const key = `${x},${y},${vx},${vy}`
  const previous = seenAt.get(key)
  if (previous !== undefined) {
    const cycle = t - previous
    const [fx, fy] = history[previous + ((duration - previous) % cycle)]
    x = fx
    y = fy
    break
  }
  seenAt.set(key, t)
  history.push([x, y])

  x += vx
  y += vy
  if (Math.max(Math.abs(x), Math.abs(y)) <= radius) {
    crashed = true
    break
  }
  vx -= Math.sign(x)
  vy -= Math.sign(y)
}

console.log(`${x} ${y} ${crashed ? 1 : 0}`)
