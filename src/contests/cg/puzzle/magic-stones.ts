// 🎮 CodinGame Puzzle - magic-stones
// https://www.codingame.com/training/medium/magic-stones

readline()
const levels = readline().split(" ").map(Number)
const count: { [k: number]: number } = {}
for (const l of levels) count[l] = (count[l] || 0) + 1
const keys = Object.keys(count)
  .map(Number)
  .sort((a, b) => a - b)
let total = 0
let maxLevel = keys[keys.length - 1] || 0
const cnt: { [k: number]: number } = { ...count }
for (let lvl = keys[0]; lvl <= maxLevel + 30; lvl++) {
  const c = cnt[lvl] || 0
  total += c % 2
  const carry = Math.floor(c / 2)
  if (carry > 0) {
    cnt[lvl + 1] = (cnt[lvl + 1] || 0) + carry
    if (lvl + 1 > maxLevel) maxLevel = lvl + 1
  }
}
console.log(total)
