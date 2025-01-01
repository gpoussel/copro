// 🧮 Project Euler - Problem 44

export function solve() {
  const pentagonalNumbers = []
  for (let i = 1; i < 10_000; i++) {
    pentagonalNumbers.push((i * (3 * i - 1)) / 2)
  }
  const pentagonalNumbersSet = new Set(pentagonalNumbers)
  let minDifference = Infinity
  for (let i = 0; i < pentagonalNumbers.length; ++i) {
    for (let j = i + 1; j < pentagonalNumbers.length; ++j) {
      const sum = pentagonalNumbers[i] + pentagonalNumbers[j]
      const difference = pentagonalNumbers[j] - pentagonalNumbers[i]
      if (difference > minDifference) {
        break
      }
      if (pentagonalNumbersSet.has(sum) && pentagonalNumbersSet.has(difference)) {
        minDifference = difference
      }
    }
  }
  return minDifference
}
