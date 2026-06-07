// 🎮 CodinGame Puzzle - the-mystic-rectangle
// https://www.codingame.com/training/easy/the-mystic-rectangle

const [x, y] = readline().split(" ").map(Number)
const [u, v] = readline().split(" ").map(Number)

// Map dimensions: width=200, height=150
const W = 200
const H = 150

// Shortest wrapped distance in each axis
const rawDx = Math.abs(u - x)
const rawDy = Math.abs(v - y)
const dx = Math.min(rawDx, W - rawDx)
const dy = Math.min(rawDy, H - rawDy)

// Strategy: use diagonal steps for min(dx, dy) steps (each costs 0.5s),
// then remaining distance in x costs 0.3s/unit, remaining in y costs 0.4s/unit.
const diag = Math.min(dx, dy)
const remX = dx - diag
const remY = dy - diag

const time = diag * 0.5 + remX * 0.3 + remY * 0.4

// Output with one decimal place
console.log(time.toFixed(1))
