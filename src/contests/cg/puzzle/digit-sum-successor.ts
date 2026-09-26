// 🎮 CodinGame Puzzle - digit-sum-successor
// https://www.codingame.com/training/medium/digit-sum-successor

const numDigits = ("0" + readline().trim()).split("").map(Number)

// Rightmost digit that can be incremented while some digit weight remains on its right
let suffixSum = 0
let pos = numDigits.length - 1
for (; pos >= 0; pos--) {
  if (numDigits[pos] < 9 && suffixSum > 0) break
  suffixSum += numDigits[pos]
}
numDigits[pos]++
// Redistribute the remaining weight as small as possible: 9s packed on the right
let remaining = suffixSum - 1
for (let i = numDigits.length - 1; i > pos; i--) {
  numDigits[i] = Math.min(9, remaining)
  remaining -= numDigits[i]
}
console.log(numDigits.join("").replace(/^0+/, ""))
