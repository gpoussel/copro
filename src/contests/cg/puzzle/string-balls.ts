// 🎮 CodinGame Puzzle - string-balls
// https://www.codingame.com/training/medium/string-balls

const radius = parseInt(readline())
const center = readline().trim()

// ways[d] = number of prefixes at distance exactly d from the center's prefix
let ways: number[] = new Array(radius + 1).fill(0)
ways[0] = 1
for (const ch of center) {
  const c = ch.charCodeAt(0) - 97
  const next: number[] = new Array(radius + 1).fill(0)
  for (let d = 0; d <= radius; d++) {
    if (ways[d] === 0) continue
    for (let letter = 0; letter < 26; letter++) {
      const nd = d + Math.abs(letter - c)
      if (nd <= radius) next[nd] += ways[d]
    }
  }
  ways = next
}

console.log(ways.reduce((sum, v) => sum + v, 0))
