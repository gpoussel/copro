// 🎮 CodinGame Puzzle - ascii-art
// https://www.codingame.com/training/easy/ascii-art

const L = parseInt(readline())
const H = parseInt(readline())
const T = readline()

const rows: string[] = []
for (let i = 0; i < H; i++) {
  rows.push(readline())
}

// The ASCII art contains A-Z plus ? (27 chars total)
// Each letter occupies L columns in each row

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?"

for (let row = 0; row < H; row++) {
  let line = ""
  for (const ch of T) {
    const upper = ch.toUpperCase()
    let idx = ALPHABET.indexOf(upper)
    if (idx === -1) {
      // Not a letter — use '?' which is the last character (index 26)
      idx = 26
    }
    const start = idx * L
    line += rows[row].substring(start, start + L)
  }
  console.log(line)
}
