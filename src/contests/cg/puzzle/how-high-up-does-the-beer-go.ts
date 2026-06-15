// 🎮 CodinGame Puzzle - how-high-up-does-the-beer-go
// https://www.codingame.com/

const [bottomRadius, topRadius, glassHeight, beerVol] = readline().split(" ").map(Number)

const slope = (topRadius - bottomRadius) / glassHeight

const volumeUpTo = (h: number): number => {
  const r = bottomRadius
  const R = bottomRadius + slope * h
  return (1 / 3) * Math.PI * h * (r * r + r * R + R * R)
}

let lo = 0
let hi = glassHeight
for (let i = 0; i < 200; i++) {
  const mid = (lo + hi) / 2
  if (volumeUpTo(mid) < beerVol) {
    lo = mid
  } else {
    hi = mid
  }
}

console.log(((lo + hi) / 2).toFixed(1))
