// 🎮 CodinGame Puzzle - smile-frieze-cheese
// https://www.codingame.com/training/medium/smile-frieze-cheese

const n = parseInt(readline())
const rows: string[] = []
for (let i = 0; i < n; i++) rows.push(readline().trim())
const width = rows[0].length
const mod = (a: number) => ((a % width) + width) % width

// The pattern is a whole number of periods, so it can be treated as a cylinder.
// Does the transform (r, c) -> (flip ? n-1-r : r, mirror ? s-c : c+s) map the frieze onto itself?
const invariant = (flip: boolean, mirror: boolean, s: number) =>
  rows.every((row, r) => {
    const target = rows[flip ? n - 1 - r : r]
    for (let c = 0; c < width; c++) if (target[mod(mirror ? s - c : c + s)] !== row[c]) return false
    return true
  })
const anyShift = (flip: boolean, mirror: boolean, from: number) => {
  for (let s = from; s < width; s++) if (invariant(flip, mirror, s)) return true
  return false
}

const horizontal = invariant(true, false, 0)
const vertical = anyShift(false, true, 0)
const rotation = anyShift(true, true, 0)
const glide = anyShift(true, false, 1)

let name: string
if (horizontal) name = vertical ? "pmm2" : "p1m1"
else if (vertical) name = rotation ? "pma2" : "pm11"
else if (rotation) name = "p112"
else if (glide) name = "p1a1"
else name = "p111"
console.log(name)
