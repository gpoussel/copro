// 🎮 CodinGame Puzzle - the-barnyard
// https://www.codingame.com/training/expert/the-barnyard

// n species, n counted characteristics: a square linear system. Solve it
// with Gauss-Jordan elimination (partial pivoting) and round the result.

const traits: Record<string, Record<string, number>> = {
  Rabbits: { Heads: 1, Horns: 0, Legs: 4, Wings: 0, Eyes: 2 },
  Chickens: { Heads: 1, Horns: 0, Legs: 2, Wings: 2, Eyes: 2 },
  Cows: { Heads: 1, Horns: 2, Legs: 4, Wings: 0, Eyes: 2 },
  Pegasi: { Heads: 1, Horns: 0, Legs: 4, Wings: 2, Eyes: 2 },
  Demons: { Heads: 1, Horns: 4, Legs: 4, Wings: 2, Eyes: 4 },
}

const speciesCount = Number(readline())
const species = readline().trim().split(/\s+/)
const matrix: number[][] = []
for (let i = 0; i < speciesCount; i++) {
  const [thing, value] = readline().trim().split(/\s+/)
  matrix.push([...species.map(s => traits[s][thing]), Number(value)])
}

for (let col = 0; col < speciesCount; col++) {
  let pivot = col
  for (let r = col + 1; r < speciesCount; r++) {
    if (Math.abs(matrix[r][col]) > Math.abs(matrix[pivot][col])) pivot = r
  }
  ;[matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]]
  const p = matrix[col][col]
  for (let c = col; c <= speciesCount; c++) matrix[col][c] /= p
  for (let r = 0; r < speciesCount; r++) {
    if (r === col || matrix[r][col] === 0) continue
    const f = matrix[r][col]
    for (let c = col; c <= speciesCount; c++) matrix[r][c] -= f * matrix[col][c]
  }
}

species.forEach((s, i) => console.log(`${s} ${Math.round(matrix[i][speciesCount])}`))
