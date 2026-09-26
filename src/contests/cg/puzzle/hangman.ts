// 🎮 CodinGame Puzzle - hangman
// https://www.codingame.com/training/medium/hangman

const entry = readline()
const guesses = readline().trim().split(/\s+/)

const found: { [letter: string]: boolean } = {}
const tried: { [letter: string]: boolean } = {}
let errors = 0

const isComplete = (): boolean => {
  for (const ch of entry) if (ch !== " " && !found[ch.toLowerCase()]) return false
  return true
}

for (const g of guesses) {
  if (errors >= 6 || isComplete()) break
  if (tried[g]) errors++
  else {
    tried[g] = true
    if (entry.toLowerCase().indexOf(g) >= 0) found[g] = true
    else errors++
  }
}

const BS = "\\"
const rows = [
  "+--+",
  errors >= 1 ? "|  o" : "|",
  errors >= 4 ? "| /|" + BS : errors === 3 ? "| /|" : errors === 2 ? "|  |" : "|",
  errors >= 6 ? "|" + BS + "/ " + BS : errors === 5 ? "|" + BS + "/" : "|" + BS,
]
const shown = entry
  .split("")
  .map(ch => (ch === " " || found[ch.toLowerCase()] ? ch : "_"))
  .join("")
console.log(rows.join("\n") + "\n" + shown)
