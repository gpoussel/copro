// 🎮 CodinGame Puzzle - fold-and-cut
// https://www.codingame.com/training/hard/fold-and-cut

// Axes are independent. Along one axis, the paper spans grid lines 0..2^k
// (k folds on that axis); folding maps every original line to a position in
// the shrinking packet, ending in {0, 1}. The cut corner selects, on each axis,
// the original lines that end on the cut side; each (x, y) pair of such lines
// strictly inside the sheet becomes one hole (those on the border are notches).

const [folds, corner] = readline().trim().split("-")

// Number of interior original lines landing on side `end` (0 = low, 1 = high).
// `backward` folds move the high half onto the low half.
const interiorOnSide = (moves: boolean[], end: number): number => {
  const size = 1 << moves.length
  const pos = Array.from({ length: size + 1 }, (_, i) => i)
  let w = size
  for (const backward of moves) {
    const half = w / 2
    for (let i = 0; i <= size; i++) {
      const p = pos[i]
      if (backward) pos[i] = p > half ? w - p : p
      else pos[i] = p < half ? half - p : p - half
    }
    w = half
  }
  let count = 0
  for (let i = 1; i < size; i++) if (pos[i] === end) count++
  return count
}

// x grows to the right: R folds right onto left (high → low); L the reverse.
const xMoves = [...folds].filter(c => c === "R" || c === "L").map(c => c === "R")
// y grows downwards: B folds bottom onto top (high → low); T the reverse.
const yMoves = [...folds].filter(c => c === "T" || c === "B").map(c => c === "B")

const xs = interiorOnSide(xMoves, corner[1] === "l" ? 0 : 1)
const ys = interiorOnSide(yMoves, corner[0] === "t" ? 0 : 1)
console.log(xs * ys)
