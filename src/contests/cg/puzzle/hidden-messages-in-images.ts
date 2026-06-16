// 🎮 CodinGame Puzzle - hidden-messages-in-images
// https://www.codingame.com/training/easy/hidden-messages-in-images

const [, h] = readline().split(" ").map(Number)
const bits: number[] = []

for (let i = 0; i < h; i++) {
  const pixels = readline().split(" ").map(Number)
  for (const pixel of pixels) {
    bits.push(pixel & 1)
  }
}

let result = ""
for (let i = 0; i < bits.length; i += 8) {
  let byte = 0
  for (let b = 0; b < 8; b++) {
    byte = (byte << 1) | bits[i + b]
  }
  result += String.fromCharCode(byte)
}

console.log(result)
