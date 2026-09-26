// 🎮 CodinGame Multiplayer - back-to-the-code
// https://www.codingame.com/multiplayer/bot-programming/back-to-the-code
//
// 35x20 grid: walking onto a neutral cell claims it, enclosing neutral cells
// claims them too. Plan: pick the rectangle with the best (neutral cells
// gained) / (steps to its nearest corner + perimeter cells to claim) that has
// no enemy cell, walk its perimeter corner to corner, replan when an enemy
// takes a perimeter cell. Area checks use prefix sums. BACK is never used.

const W = 35
const H = 20
const opponents = parseInt(readline())

let plan: [number, number][] = [] // remaining corners to reach
let rect: [number, number, number, number] | null = null // x0 y0 x1 y1

while (true) {
  readline() // game round
  const [mx, my] = readline().split(" ").map(Number)
  for (let i = 0; i < opponents; i++) readline()
  const grid: string[] = []
  for (let y = 0; y < H; y++) grid.push(readline())

  // Prefix sums of enemy cells and of neutral cells.
  const enemy = new Int32Array((W + 1) * (H + 1))
  const neutral = new Int32Array((W + 1) * (H + 1))
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = grid[y][x]
      const i = (y + 1) * (W + 1) + x + 1
      enemy[i] = (c !== "." && c !== "0" ? 1 : 0) + enemy[i - 1] + enemy[i - W - 1] - enemy[i - W - 2]
      neutral[i] = (c === "." ? 1 : 0) + neutral[i - 1] + neutral[i - W - 1] - neutral[i - W - 2]
    }
  }
  const sum = (p: Int32Array, x0: number, y0: number, x1: number, y1: number) =>
    x1 < x0 || y1 < y0
      ? 0
      : p[(y1 + 1) * (W + 1) + x1 + 1] - p[y0 * (W + 1) + x1 + 1] - p[(y1 + 1) * (W + 1) + x0] + p[y0 * (W + 1) + x0]
  const ring = (p: Int32Array, x0: number, y0: number, x1: number, y1: number) =>
    sum(p, x0, y0, x1, y1) - sum(p, x0 + 1, y0 + 1, x1 - 1, y1 - 1)

  // Is the current plan still sound?
  if (rect && sum(enemy, ...rect) > 0) plan = []
  while (plan.length && plan[0][0] === mx && plan[0][1] === my) plan.shift()

  if (!plan.length) {
    let best = -1
    rect = null
    for (let x0 = 0; x0 < W; x0++) {
      for (let y0 = 0; y0 < H; y0++) {
        for (let w = 2; w <= 12 && x0 + w < W; w++) {
          for (let h = 2; h <= 10 && y0 + h < H; h++) {
            const x1 = x0 + w
            const y1 = y0 + h
            const corners: [number, number][] = [
              [x0, y0],
              [x1, y0],
              [x1, y1],
              [x0, y1],
            ]
            const d = Math.min(...corners.map(([cx, cy]) => Math.abs(cx - mx) + Math.abs(cy - my)))
            if (d > 20) continue
            if (sum(enemy, x0, y0, x1, y1) > 0) continue
            const gain = sum(neutral, x0, y0, x1, y1)
            if (gain < 4) continue
            const cost = d + ring(neutral, x0, y0, x1, y1) + 1
            const score = gain / cost
            if (score > best) {
              best = score
              rect = [x0, y0, x1, y1]
            }
          }
        }
      }
    }
    if (rect) {
      const [x0, y0, x1, y1] = rect
      const corners: [number, number][] = [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]
      // Start at the nearest corner and go round back to it.
      let k = 0
      for (let j = 1; j < 4; j++) {
        const dj = Math.abs(corners[j][0] - mx) + Math.abs(corners[j][1] - my)
        const dk = Math.abs(corners[k][0] - mx) + Math.abs(corners[k][1] - my)
        if (dj < dk) k = j
      }
      plan = [0, 1, 2, 3, 4].map(j => corners[(k + j) % 4])
      while (plan.length && plan[0][0] === mx && plan[0][1] === my) plan.shift()
    }
  }
  if (plan.length) {
    // Move along one axis at a time so we follow the rectangle's edges.
    const [tx, ty] = plan[0]
    const target = mx !== tx && my !== ty ? [tx, my] : [tx, ty]
    console.log(`${target[0]} ${target[1]}`)
  } else {
    // Nothing worth enclosing: walk to the nearest neutral cell.
    let bx = mx
    let by = my
    let bd = Infinity
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (grid[y][x] === "." && Math.abs(x - mx) + Math.abs(y - my) < bd) {
          bd = Math.abs(x - mx) + Math.abs(y - my)
          bx = x
          by = y
        }
    console.log(`${bx} ${by}`)
  }
}
