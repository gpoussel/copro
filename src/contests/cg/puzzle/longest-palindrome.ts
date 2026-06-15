// 🎮 CodinGame Puzzle - longest-palindrome
// https://www.codingame.com/training/hard/longest-palindrome

const s: string = readline()
const n: number = s.length
const t: string[] = ["^"]
for (let i = 0; i < n; i++) {
  t.push("#")
  t.push(s[i])
}
t.push("#")
t.push("$")
const m: number = t.length
const p: number[] = new Array(m).fill(0)
let center = 0
let right = 0
for (let i = 1; i < m - 1; i++) {
  if (i < right) {
    p[i] = Math.min(right - i, p[2 * center - i])
  }
  while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
    p[i]++
  }
  if (i + p[i] > right) {
    center = i
    right = i + p[i]
  }
}
let maxLen = 0
for (let i = 1; i < m - 1; i++) {
  if (p[i] > maxLen) maxLen = p[i]
}
const out: string[] = []
const seen = new Set<number>()
for (let i = 1; i < m - 1; i++) {
  if (p[i] === maxLen) {
    const start = (i - p[i]) / 2
    if (!seen.has(start)) {
      seen.add(start)
      out.push(s.substr(start, maxLen))
    }
  }
}
console.log(out.join("\n"))
