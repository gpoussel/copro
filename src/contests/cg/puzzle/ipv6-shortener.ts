// 🎮 CodinGame Puzzle - ipv6-shortener
// https://www.codingame.com/training/easy/ipv6-shortener

const ip = readline()
const blocks = ip.split(":")

// Step 1: Remove leading zeros from each block
const stripped = blocks.map(b => parseInt(b, 16).toString(16))

// Step 2: Find the longest consecutive run of "0" blocks
let bestStart = -1
let bestLen = 0
let curStart = -1
let curLen = 0

for (let i = 0; i < stripped.length; i++) {
  if (stripped[i] === "0") {
    if (curLen === 0) curStart = i
    curLen++
    if (curLen > bestLen) {
      bestLen = curLen
      bestStart = curStart
    }
  } else {
    curLen = 0
  }
}

// Step 3: Compress - only replace with :: if there are 2+ consecutive zero blocks
let result: string
if (bestLen >= 2) {
  const before = stripped.slice(0, bestStart)
  const after = stripped.slice(bestStart + bestLen)
  result = before.join(":") + "::" + after.join(":")
} else {
  result = stripped.join(":")
}

console.log(result)
