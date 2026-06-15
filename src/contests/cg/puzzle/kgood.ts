// 🎮 CodinGame Puzzle - kgood
// https://www.codingame.com/training/hard/kgood

const s: string = readline()
const K: number = parseInt(readline(), 10)
const count = new Map<string, number>()
let left = 0
let best = 0
let distinct = 0
for (let right = 0; right < s.length; right++) {
  const c = s[right]
  const cur = count.get(c) ?? 0
  if (cur === 0) distinct++
  count.set(c, cur + 1)
  while (distinct > K) {
    const lc = s[left]
    const lv = (count.get(lc) ?? 0) - 1
    count.set(lc, lv)
    if (lv === 0) distinct--
    left++
  }
  const len = right - left + 1
  if (len > best) best = len
}
console.log(best)
