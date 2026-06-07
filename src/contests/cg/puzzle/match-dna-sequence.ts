// 🎮 CodinGame Puzzle - match-dna-sequence
// https://www.codingame.com/training/easy/match-dna-sequence

const delta = parseInt(readline())
const gene = readline()
const n = parseInt(readline())

let bestChrIndex = -1
let bestStart = -1
let bestDiff = Infinity

for (let i = 0; i < n; i++) {
  const chr = readline()

  // Try each possible start position in chr
  for (let start = 0; start < chr.length; start++) {
    let diff = 0
    for (let j = 0; j < gene.length; j++) {
      const chrPos = start + j
      if (chrPos >= chr.length) {
        // Missing characters count as differences
        diff += gene.length - j
        break
      }
      if (chr[chrPos] !== gene[j]) {
        diff++
      }
    }

    if (diff <= delta && diff < bestDiff) {
      bestDiff = diff
      bestStart = start
      bestChrIndex = i
    }
  }
}

if (bestChrIndex === -1) {
  console.log("NONE")
} else {
  console.log(`${bestChrIndex} ${bestStart} ${bestDiff}`)
}
