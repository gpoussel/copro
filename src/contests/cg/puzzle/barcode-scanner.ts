// 🎮 CodinGame Puzzle - barcode-scanner
// https://www.codingame.com/training/medium/barcode-scanner

const L_CODES = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"]
const reverse = (s: string) => s.split("").reverse().join("")
const invert = (s: string) => s.replace(/[01]/g, b => (b === "0" ? "1" : "0"))
const R_CODES = L_CODES.map(invert)
const G_CODES = R_CODES.map(reverse)
const FIRST_DIGIT_PATTERNS = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"]

function decode(bits: string): string | null {
  if (bits.length !== 95 || bits.slice(0, 3) !== "101" || bits.slice(45, 50) !== "01010" || bits.slice(92) !== "101") {
    return null
  }
  let digits = ""
  let pattern = ""
  for (let i = 0; i < 6; i++) {
    const code = bits.substr(3 + 7 * i, 7)
    const l = L_CODES.indexOf(code)
    const g = G_CODES.indexOf(code)
    if (l >= 0) {
      digits += l
      pattern += "L"
    } else if (g >= 0) {
      digits += g
      pattern += "G"
    } else return null
  }
  for (let i = 0; i < 6; i++) {
    const r = R_CODES.indexOf(bits.substr(50 + 7 * i, 7))
    if (r < 0) return null
    digits += r
  }
  const first = FIRST_DIGIT_PATTERNS.indexOf(pattern)
  if (first < 0) return null
  const all = first + digits
  let sum = 0
  for (let i = 0; i < 13; i++) sum += Number(all[i]) * (i % 2 === 1 ? 3 : 1)
  return sum % 10 === 0 ? all : null
}

const scanline = readline().trim()
console.log(decode(scanline) || decode(reverse(scanline)) || "INVALID SCAN")
