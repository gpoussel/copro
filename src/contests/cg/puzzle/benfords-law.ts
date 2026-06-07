// 🎮 CodinGame Puzzle - benfords-law
// https://www.codingame.com/training/easy/benfords-law

// Benford's law expected percentages for leading digits 1-9
const BENFORD = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
const MARGIN = 10

const n = parseInt(readline())
const counts = new Array(10).fill(0)

for (let i = 0; i < n; i++) {
  const line = readline()
  // Find the first digit 1-9 in the transaction string.
  // We skip zeros because a leading zero (e.g. "0.50") means the significant digit is after the decimal.
  // Strategy: scan characters left-to-right, skip non-digits, skip '0', take first non-zero digit found.
  let found = false
  for (let j = 0; j < line.length; j++) {
    const c = line[j]
    if (c >= "1" && c <= "9") {
      counts[parseInt(c)]++
      found = true
      break
    }
  }
  // If no non-zero digit found, this transaction doesn't contribute a leading digit
  // (shouldn't happen per problem constraints, but handle gracefully)
}

let fraudulent = false
for (let d = 1; d <= 9; d++) {
  const actualPct = (counts[d] / n) * 100
  const expected = BENFORD[d - 1]
  if (actualPct < expected - MARGIN || actualPct > expected + MARGIN) {
    fraudulent = true
    break
  }
}

console.log(fraudulent ? "true" : "false")
