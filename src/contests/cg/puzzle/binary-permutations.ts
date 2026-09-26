// 🎮 CodinGame Puzzle - binary-permutations
// https://www.codingame.com/training/hard/binary-permutations

// Input bit i can map to output bit j only if, for every clue, bit i of X equals
// bit j of Y. Backtrack over those candidates to find a consistent bijection.

const [n, c] = readline().split(" ").map(Number)
const clues: [number, number][] = []
for (let k = 0; k < c; k++) {
  const [x, y] = readline().split(" ").map(Number)
  clues.push([x, y])
}

const compatible = (i: number, j: number): boolean => clues.every(([x, y]) => ((x >> i) & 1) === ((y >> j) & 1))

const target: number[] = new Array(n).fill(-1)
const used: boolean[] = new Array(n).fill(false)
const search = (i: number): boolean => {
  if (i === n) return true
  for (let j = 0; j < n; j++) {
    if (used[j] || !compatible(i, j)) continue
    used[j] = true
    target[i] = j
    if (search(i + 1)) return true
    used[j] = false
  }
  return false
}
search(0)

console.log(target.map(j => 1 << j).join(" "))
