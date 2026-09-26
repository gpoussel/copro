// 🎮 CodinGame Puzzle - cylinders
// https://www.codingame.com/training/medium/cylinders

// Circles laid on a line, in a given order: each center is pushed right until it touches
// neither the left wall nor any previous circle (tangent distance 2*sqrt(r1*r2)).
function minWidth(radii: number[]): number {
  const m = radii.length
  const used: boolean[] = new Array(m).fill(false)
  const placedR: number[] = []
  const placedX: number[] = []
  let best = Infinity

  const dfs = (right: number): void => {
    if (right >= best) return
    if (placedR.length === m) {
      best = right
      return
    }
    const tried: number[] = []
    for (let i = 0; i < m; i++) {
      const r = radii[i]
      if (used[i] || tried.indexOf(r) >= 0) continue
      tried.push(r)
      let x = r
      for (let k = 0; k < placedR.length; k++) x = Math.max(x, placedX[k] + 2 * Math.sqrt(r * placedR[k]))
      used[i] = true
      placedR.push(r)
      placedX.push(x)
      dfs(Math.max(right, x + r))
      placedR.pop()
      placedX.pop()
      used[i] = false
    }
  }
  dfs(0)
  return best
}

const testCount = parseInt(readline())
const results: string[] = []
for (let t = 0; t < testCount; t++) {
  const nums = readline().trim().split(/\s+/).map(Number)
  results.push(minWidth(nums.slice(1, 1 + nums[0])).toFixed(3))
}
console.log(results.join("\n"))
