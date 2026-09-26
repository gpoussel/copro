// 🎮 CodinGame Puzzle - beach-volleyball
// https://www.codingame.com/training/medium/beach-volleyball

const [startX, startY] = readline().split(" ").map(Number)
const beachY = parseInt(readline())
const [ballX, ballY] = readline().split(" ").map(Number)
const speedLand = parseInt(readline())
const speedWater = parseInt(readline())

const travelTime = (x: number) =>
  Math.hypot(x - startX, beachY - startY) / speedLand + Math.hypot(ballX - x, ballY - beachY) / speedWater

// The travel time is convex in x: integer ternary search between both x coordinates
let lo = Math.min(startX, ballX)
let hi = Math.max(startX, ballX)
while (hi - lo > 2) {
  const m1 = lo + Math.floor((hi - lo) / 3)
  const m2 = hi - Math.floor((hi - lo) / 3)
  if (travelTime(m1) <= travelTime(m2)) hi = m2
  else lo = m1
}
let best = lo
for (let x = lo; x <= hi; x++) if (travelTime(x) < travelTime(best)) best = x
console.log(best)
