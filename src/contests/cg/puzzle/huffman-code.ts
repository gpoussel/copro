// 🎮 CodinGame Puzzle - huffman-code
// https://www.codingame.com/training/medium/huffman-code

const count = parseInt(readline())
const weights = readline().trim().split(/\s+/).map(Number).slice(0, count)

if (count === 1) {
  // A single symbol still needs one bit per occurrence
  console.log(weights[0])
} else {
  // Two-queue Huffman: sorted leaves + merged nodes (merged weights are produced in non-decreasing order)
  const leaves = weights.slice().sort((a, b) => a - b)
  const merged: number[] = []
  let li = 0
  let mi = 0
  const takeSmallest = (): number => {
    if (mi >= merged.length || (li < leaves.length && leaves[li] <= merged[mi])) return leaves[li++]
    return merged[mi++]
  }
  // Total bits = sum of all internal node weights
  let totalBits = 0
  for (let k = 1; k < count; k++) {
    const w = takeSmallest() + takeSmallest()
    totalBits += w
    merged.push(w)
  }
  console.log(totalBits)
}
