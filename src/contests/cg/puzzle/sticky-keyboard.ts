// 🎮 CodinGame Puzzle - sticky-keyboard
// https://www.codingame.com/training/medium/sticky-keyboard

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())

const counts = new Map<string, number>()
for (const line of lines) for (const word of line.match(/[a-z]+/g) || []) counts.set(word, (counts.get(word) || 0) + 1)

const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

// Candidate corrections: remove one doubled letter, or insert one missing letter
const candidates = (word: string): string[] => {
  const result: string[] = []
  for (let i = 0; i + 1 < word.length; i++) if (word[i] === word[i + 1]) result.push(word.slice(0, i) + word.slice(i + 1))
  for (let i = 0; i <= word.length; i++)
    for (const letter of ALPHABET) result.push(word.slice(0, i) + letter + word.slice(i))
  return result
}

const fixes = new Map<string, string>()
counts.forEach((count, word) => {
  let best = word
  let bestCount = count
  for (const candidate of candidates(word)) {
    const c = counts.get(candidate) || 0
    if (c > bestCount) {
      best = candidate
      bestCount = c
    }
  }
  fixes.set(word, best)
})

console.log(lines.map(line => line.replace(/[a-z]+/g, word => fixes.get(word)!)).join("\n"))
