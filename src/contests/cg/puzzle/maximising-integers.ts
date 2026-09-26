// 🎮 CodinGame Puzzle - maximising-integers
// https://www.codingame.com/training/hard/maximising-integers

// Swaps only across parities: the relative order of even digits (and of odd
// digits) is fixed, but the two sequences can be interleaved freely.
// Their heads never tie (different parity), so greedily take the larger head.

const digitsIn = readline().trim()
const evens = [...digitsIn].filter(d => Number(d) % 2 === 0)
const odds = [...digitsIn].filter(d => Number(d) % 2 === 1)
let result = ""
let i = 0
let j = 0
while (i < evens.length || j < odds.length) {
  if (j >= odds.length || (i < evens.length && evens[i] > odds[j])) result += evens[i++]
  else result += odds[j++]
}
console.log(result)
