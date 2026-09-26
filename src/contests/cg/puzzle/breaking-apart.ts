// 🎮 CodinGame Puzzle - breaking-apart
// https://www.codingame.com/training/hard/breaking-apart

// Greedy line filling: whole words first, then the longest syllable prefix of
// the next word (at least two letters) that still fits with its hyphen.

const width = Number(readline())
const words = readline()
  .trim()
  .split(/\s+/)
  .filter(w => w.length > 0)

const isVowel = (ch: string): boolean => "aeiou".includes(ch.toLowerCase())

// Positions where a new syllable starts (excluding the first one)
function breakPoints(word: string): number[] {
  const vowels: number[] = []
  for (let i = 0; i < word.length; i++) if (isVowel(word[i])) vowels.push(i)
  const res: number[] = []
  for (let k = 0; k + 1 < vowels.length; k++) {
    const a = vowels[k]
    const b = vowels[k + 1]
    const cons = b - a - 1
    // No consonant: split between vowels; one: it goes to the next vowel;
    // two or more: the first stays with the previous vowel
    res.push(cons === 0 ? b : cons === 1 ? a + 1 : a + 2)
  }
  return res
}

const out: string[] = []
let line = ""
let idx = 0
let word = words.length > 0 ? words[0] : ""
while (idx < words.length) {
  const sep = line.length > 0 ? 1 : 0
  if (line.length + sep + word.length <= width) {
    line += (sep ? " " : "") + word
    idx++
    if (idx < words.length) word = words[idx]
    continue
  }
  // Try the longest prefix that fits
  const room = width - line.length - sep - 1
  let cut = -1
  for (const p of breakPoints(word)) if (p >= 2 && p <= room) cut = Math.max(cut, p)
  if (cut > 0) {
    out.push(line + (sep ? " " : "") + word.slice(0, cut) + "-")
    word = word.slice(cut)
    line = ""
  } else if (line.length > 0) {
    out.push(line)
    line = ""
  } else {
    // A single chunk longer than the line: nothing better to do
    out.push(word)
    idx++
    if (idx < words.length) word = words[idx]
  }
}
if (line.length > 0) out.push(line)
console.log(out.join("\n"))
