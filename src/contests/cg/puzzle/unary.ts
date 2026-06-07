// 🎮 CodinGame Puzzle - unary
// https://www.codingame.com/training/easy/unary

const message = readline()

// Convert message to 7-bit binary string
let bits = ""
for (let i = 0; i < message.length; i++) {
  const code = message.charCodeAt(i)
  bits += code.toString(2).padStart(7, "0")
}

// Run-length encode the binary string
const blocks: string[] = []
let i = 0
while (i < bits.length) {
  const currentBit = bits[i]
  let count = 0
  while (i < bits.length && bits[i] === currentBit) {
    count++
    i++
  }
  // First block: '0' for 1-bits, '00' for 0-bits
  const prefix = currentBit === "1" ? "0" : "00"
  // Second block: count zeros
  const suffix = "0".repeat(count)
  blocks.push(prefix, suffix)
}

console.log(blocks.join(" "))
