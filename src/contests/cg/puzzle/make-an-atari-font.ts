// 🎮 CodinGame Puzzle - make-an-atari-font
// https://www.codingame.com/training/easy/make-an-atari-font

const hexData: Record<string, string> = {
  A: "1818243C42420000",
  B: "7844784444780000",
  C: "3844808044380000",
  D: "7844444444780000",
  E: "7C407840407C0000",
  F: "7C40784040400000",
  G: "3844809C44380000",
  H: "42427E4242420000",
  I: "3E080808083E0000",
  J: "1C04040444380000",
  K: "4448507048440000",
  L: "40404040407E0000",
  M: "4163554941410000",
  N: "4262524A46420000",
  O: "1C222222221C0000",
  P: "7844784040400000",
  Q: "1C222222221C0200",
  R: "7844785048440000",
  S: "1C22100C221C0000",
  T: "7F08080808080000",
  U: "42424242423C0000",
  V: "8142422424180000",
  W: "4141495563410000",
  X: "4224181824420000",
  Y: "4122140808080000",
  Z: "7E040810207E0000",
}

const word = readline().trim()

// Each letter is 8 bytes; byte r is row r, bit 7 is the leftmost pixel.
function letterRows(ch: string): string[] {
  const hex = hexData[ch]
  const rows: string[] = []
  for (let r = 0; r < 8; r++) {
    const byte = parseInt(hex.substr(r * 2, 2), 16)
    let row = ""
    for (let bit = 7; bit >= 0; bit--) {
      row += byte & (1 << bit) ? "X" : " "
    }
    rows.push(row)
  }
  return rows
}

const letters = word.split("").map(letterRows)
const out: string[] = []
for (let r = 0; r < 8; r++) {
  let line = ""
  for (const lr of letters) {
    line += lr[r]
  }
  line = line.replace(/\s+$/, "") // drop trailing spaces
  if (line.length > 0) out.push(line) // skip blank lines
}
console.log(out.join("\n"))
