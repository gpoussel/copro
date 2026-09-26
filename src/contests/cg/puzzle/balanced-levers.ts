// 🎮 CodinGame Puzzle - balanced-levers
// https://www.codingame.com/training/hard/balanced-levers

// Classic "mobile computing": for every subset of weights, enumerate all
// reachable (left extent, right extent) pairs by splitting it into a left
// and a right sub-mobile hung at the ends of a unit rod.
const limit = parseFloat(readline())
const n = parseInt(readline())
const weights: number[] = []
while (weights.length < n) {
  const line = readline()
  if (line === undefined) break
  for (const tok of line.trim().split(/\s+/)) if (tok !== "") weights.push(parseInt(tok))
}

type Shape = [number, number] // [left, right] extents from the hanging point
const full = (1 << n) - 1
const total = new Array<number>(full + 1).fill(0)
for (let s = 1; s <= full; s++) for (let i = 0; i < n; i++) if (s & (1 << i)) total[s] += weights[i]

const shapes: Shape[][] = new Array<Shape[]>(full + 1)
const build = (s: number): Shape[] => {
  if (shapes[s]) return shapes[s]
  const result: Shape[] = []
  if ((s & (s - 1)) === 0) result.push([0, 0])
  else {
    for (let a = (s - 1) & s; a > 0; a = (a - 1) & s) {
      const b = s ^ a
      // pivot position: distance to left end, to right end
      const dl = total[b] / total[s]
      const dr = total[a] / total[s]
      for (const [al, ar] of build(a))
        for (const [bl, br] of build(b)) {
          const left = Math.max(dl + al, bl - dr)
          const right = Math.max(dr + br, ar - dl)
          // designs wider than the room can never become valid again
          if (left + right <= limit + 1e-12) result.push([left, right])
        }
    }
  }
  shapes[s] = result
  return result
}

let best = -1
for (const [l, r] of build(full)) best = Math.max(best, l + r)
console.log(best < 0 ? "-1" : best.toFixed(4))
