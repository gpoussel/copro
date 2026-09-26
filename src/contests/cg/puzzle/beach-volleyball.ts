// 🎮 CodinGame Puzzle - beach-volleyball
// https://www.codingame.com/training/medium/beach-volleyball

const [startX, startY] = readline().split(" ").map(Number)
const beachY = parseInt(readline())
const [ballX, ballY] = readline().split(" ").map(Number)
const speedLand = parseInt(readline())
const speedWater = parseInt(readline())

const landLength = (x: number) => Math.hypot(x - startX, beachY - startY)
const waterLength = (x: number) => Math.hypot(ballX - x, ballY - beachY)

// time(x + 1) - time(x), computed without cancellation: hypot(u + 1) - hypot(u) = (2u + 1) / (hypot(u + 1) + hypot(u))
const step = (x: number) =>
  (2 * (x - startX) + 1) / (landLength(x + 1) + landLength(x)) / speedLand +
  (2 * (x - ballX) + 1) / (waterLength(x + 1) + waterLength(x)) / speedWater

// The travel time is convex in x, so its steps increase: find the first x whose next step is not downhill
let lo = Math.min(startX, ballX)
let hi = Math.max(startX, ballX)
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2)
  if (step(mid) >= 0) hi = mid
  else lo = mid + 1
}
console.log(lo)
