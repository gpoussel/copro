// 🎮 CodinGame Puzzle - ip-mask-calculating
// https://www.codingame.com/training/medium/ip-mask-calculating

const [ipPart, maskPart] = readline().trim().split("/")
const octets = ipPart.split(".").map(o => parseInt(o, 10))
const prefixLength = Number(maskPart)

// Work octet by octet to avoid 32-bit signed shift pitfalls
const network: number[] = []
const broadcast: number[] = []
for (let i = 0; i < 4; i++) {
  const bits = Math.max(0, Math.min(8, prefixLength - 8 * i))
  const mask = (0xff << (8 - bits)) & 0xff
  network.push(octets[i] & mask)
  broadcast.push((octets[i] & mask) | (~mask & 0xff))
}

console.log(network.join("."))
console.log(broadcast.join("."))
