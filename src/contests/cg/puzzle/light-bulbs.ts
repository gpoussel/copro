// 🎮 CodinGame Puzzle - light-bulbs
// https://www.codingame.com/training/medium/light-bulbs

// The switching rules walk the reflected Gray code: a pattern's position is its Gray-to-binary value
function grayRank(pattern: string): number {
  let rank = 0
  let bit = 0
  for (const ch of pattern) {
    bit ^= ch === "1" ? 1 : 0
    rank = rank * 2 + bit
  }
  return rank
}

const startPattern = readline().trim()
const targetPattern = readline().trim()
console.log(Math.abs(grayRank(startPattern) - grayRank(targetPattern)))
