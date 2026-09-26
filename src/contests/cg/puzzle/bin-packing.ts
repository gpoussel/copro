// 🎮 CodinGame Puzzle - bin-packing
// https://www.codingame.com/training/medium/bin-packing

const canPartition = (bins: number, weights: number[]): boolean => {
  const total = weights.reduce((s, w) => s + w, 0)
  if (total % bins !== 0) return false
  const target = total / bins
  const items = weights.slice().sort((a, b) => b - a)
  if (items[0] > target) return false
  const loads: number[] = new Array(bins).fill(0)

  // Place items heaviest first; skip bins whose load was already tried for this item
  const place = (i: number): boolean => {
    if (i === items.length) return true
    const w = items[i]
    const tried: number[] = []
    for (let b = 0; b < bins; b++) {
      const load = loads[b]
      if (load + w > target || tried.indexOf(load) >= 0) continue
      tried.push(load)
      loads[b] += w
      if (place(i + 1)) return true
      loads[b] -= w
      // Nothing works in an empty bin, so no other empty bin will work either
      if (load === 0) break
    }
    return false
  }
  return place(0)
}

const n = +readline()
for (let t = 0; t < n; t++) {
  const [b, m, ...weights] = readline().trim().split(/\s+/).map(Number)
  console.log(canPartition(b, weights.slice(0, m)) ? "yes" : "no")
}
