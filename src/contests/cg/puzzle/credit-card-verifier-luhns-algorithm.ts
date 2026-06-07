// 🎮 CodinGame Puzzle - credit-card-verifier-luhns-algorithm
// https://www.codingame.com/training/easy/credit-card-verifier-luhns-algorithm

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const card = readline().replace(/ /g, "")
  const digits = card.split("").map(Number)

  // Step 1: Double every second digit from right to left (i.e., even indices from the right = odd indices from 0-based left for 16-digit card)
  // "every second digit from right to left" means positions 1, 3, 5, ... from the right (0-indexed)
  // For a 16-digit card, from right: index 15=pos0, 14=pos1(double), 13=pos2, 12=pos3(double), ...
  // So we double digits at positions (from left, 0-indexed): 1, 3, 5, 7, 9, 11, 13 (the even positions from right)

  let sumDoubled = 0
  let sumOdd = 0

  for (let j = 0; j < digits.length; j++) {
    // Position from right (0-indexed)
    const posFromRight = digits.length - 1 - j
    if (posFromRight % 2 === 1) {
      // Every second digit from right (positions 1, 3, 5, ... from right)
      let doubled = digits[j] * 2
      if (doubled >= 10) doubled -= 9
      sumDoubled += doubled
    } else {
      // Odd places from right (positions 0, 2, 4, ... from right)
      sumOdd += digits[j]
    }
  }

  const total = sumDoubled + sumOdd
  console.log(total % 10 === 0 ? "YES" : "NO")
}
