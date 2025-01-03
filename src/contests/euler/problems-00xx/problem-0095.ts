import { sumOfDivisors } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 95

const MAX = 1e6

function sumOfProperDivisors(num: number): number {
  return sumOfDivisors(num) - num
}

export function solve() {
  let longestChain = 0
  let minMemberOfLongestChain = 0
  for (let num = 2; num < MAX; num++) {
    let sum = sumOfProperDivisors(num)
    const history = new Set<number>()
    history.add(num)
    while (sum < MAX && sum !== num && !history.has(sum)) {
      history.add(sum)
      sum = sumOfProperDivisors(sum)
    }
    if (sum > MAX) continue
    if (sum === num) {
      if (history.size > longestChain) {
        longestChain = history.size
        minMemberOfLongestChain = Math.min(...history)
      }
    }
  }
  return minMemberOfLongestChain
}
