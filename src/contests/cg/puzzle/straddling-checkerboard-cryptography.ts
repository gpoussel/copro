// 🎮 CodinGame Puzzle - straddling-checkerboard-cryptography
// https://www.codingame.com/training/medium/straddling-checkerboard-cryptography

const action = +readline()
const header = readline().trim()
const passphrase = readline().replace(/\r/g, "").slice(0, 10)
const [posSlash, posDot] = readline().trim().split(/\s+/).map(Number)
const key = readline().trim()
const message = readline()

// Build the checkerboard: code (as a string of 1 or 2 digits) <-> symbol
const codeOf: { [symbol: string]: string } = {}
const symbolOf: { [code: string]: string } = {}
const rowLabels: string[] = []
for (let i = 0; i < 10; i++) {
  if (passphrase[i] === " ") rowLabels.push(header[i])
  else {
    codeOf[passphrase[i]] = header[i]
    symbolOf[header[i]] = passphrase[i]
  }
}
const remaining = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(c => passphrase.indexOf(c) < 0)
const cells: string[] = []
for (let i = 0; i < 20; i++) {
  if (i === posSlash) cells.push("/")
  else if (i === posDot) cells.push(".")
  else cells.push(remaining.shift()!)
}
cells.forEach((symbol, i) => {
  const code = rowLabels[Math.floor(i / 10)] + header[i % 10]
  codeOf[symbol] = code
  symbolOf[code] = symbol
})

// Split a digit string into board symbols
const digitsToSymbols = (digits: string): string[] => {
  const symbols: string[] = []
  for (let i = 0; i < digits.length; i++) {
    if (rowLabels.indexOf(digits[i]) >= 0) {
      if (i + 1 < digits.length) symbols.push(symbolOf[digits[i] + digits[i + 1]])
      i++
    } else symbols.push(symbolOf[digits[i]])
  }
  return symbols
}

const applyKey = (digits: string, sign: number): string =>
  digits
    .split("")
    .map((d, i) => String((+d + sign * +key[i % key.length] + 10) % 10))
    .join("")

if (action === 1) {
  let digits = ""
  for (const ch of message.toUpperCase()) {
    if (/[A-Z.]/.test(ch)) digits += codeOf[ch]
    else if (/[0-9]/.test(ch)) digits += codeOf["/"] + ch
  }
  console.log(digitsToSymbols(applyKey(digits, 1)).join(""))
} else {
  let digits = ""
  for (const ch of message.trim()) digits += codeOf[ch]
  digits = applyKey(digits, -1)
  // Decode, a "/" meaning the next digit is literal
  let out = ""
  for (let i = 0; i < digits.length; i++) {
    let symbol: string
    if (rowLabels.indexOf(digits[i]) >= 0) {
      symbol = symbolOf[digits[i] + digits[i + 1]]
      i++
    } else symbol = symbolOf[digits[i]]
    if (symbol === "/") {
      out += digits[i + 1]
      i++
    } else out += symbol
  }
  console.log(out)
}
