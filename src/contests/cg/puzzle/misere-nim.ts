// 🎮 CodinGame Puzzle - misere-nim
// https://www.codingame.com/training/hard/misere-nim

// Misère Nim theory: a position is lost for the player to move iff
// (every heap <= 1 and the nim-sum is 1) or (some heap > 1 and the nim-sum is 0).
// Winning moves are exactly those leading to such a position.

const isLosing = (heaps: number[]): boolean => {
  const xor = heaps.reduce((a, b) => a ^ b, 0)
  return heaps.every(h => h <= 1) ? xor === 1 : xor === 0
}

const [, positionCount] = readline().trim().split(/\s+/).map(Number)
for (let k = 0; k < positionCount; k++) {
  const heaps = readline().trim().split(/\s+/).map(Number)
  const moves: string[] = []
  heaps.forEach((h, i) => {
    for (let a = 1; a <= h; a++) {
      const next = [...heaps]
      next[i] -= a
      if (isLosing(next)) moves.push(`${i + 1}:${a}`)
    }
  })
  console.log(moves.length ? moves.join(" ") : "CONCEDE")
}
