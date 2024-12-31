// 🧮 Project Euler - Problem 14

function getChainLength(n: number): number {
  let count = 1
  while (n !== 1) {
    if (n % 2 === 0) {
      n /= 2
    } else {
      n = 3 * n + 1
    }
    count++
  }
  return count
}

export function solve() {
  let longestChain = 0
  let longestChainNumber = 0
  for (let i = 1; i < 1000000; i++) {
    const length = getChainLength(i)
    if (length > longestChain) {
      longestChain = length
      longestChainNumber = i
    }
  }
  return longestChainNumber
}
