// 🎮 CodinGame Puzzle - messed-up-mosaics
// https://www.codingame.com/training/easy/messed-up-mosaics

// Each row is the pattern repeated, possibly shifted (staggered) by some phase.
// For every row we pick the phase that best fits, then the single row that still
// has one mismatching tile holds the wrong tile.
const N: number = parseInt(readline())
const pattern: string = readline()
const P = pattern.length

for (let y = 0; y < N; y++) {
  const row = readline()
  let bestMismatches = Infinity
  let wrongX = -1
  for (let k = 0; k < P; k++) {
    let mismatches = 0
    let firstMismatchX = -1
    for (let x = 0; x < N; x++) {
      if (row[x] !== pattern[(x + k) % P]) {
        mismatches++
        if (firstMismatchX === -1) firstMismatchX = x
      }
    }
    if (mismatches < bestMismatches) {
      bestMismatches = mismatches
      wrongX = firstMismatchX
    }
  }
  if (bestMismatches > 0) {
    console.log(`(${wrongX},${y})`)
    break
  }
}
