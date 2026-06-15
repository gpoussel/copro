// 🎮 CodinGame Puzzle - simplify-selection-ranges
// https://www.codingame.com/training/hard/simplify-selection-ranges

const line: string = readline().trim()
const inner = line.replace(/^\[/, "").replace(/\]$/, "").trim()
const nums: number[] = inner.length === 0 ? [] : inner.split(",").map(s => parseInt(s.trim(), 10))
const uniq = Array.from(new Set(nums)).sort((a, b) => a - b)

const parts: string[] = []
let i = 0
while (i < uniq.length) {
  let j = i
  while (j + 1 < uniq.length && uniq[j + 1] === uniq[j] + 1) j++
  const len = j - i + 1
  if (len >= 3) {
    parts.push(`${uniq[i]}-${uniq[j]}`)
  } else {
    for (let k = i; k <= j; k++) parts.push(`${uniq[k]}`)
  }
  i = j + 1
}
console.log(parts.join(","))
