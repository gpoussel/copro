import { isPalindrome, reverse } from "../../../utils/string.js"

// 🧮 Project Euler - Problem 55

function isLychrel(n: number) {
  let currentValue = BigInt(n)
  for (let i = 0; i < 50; ++i) {
    const reversedValue = BigInt(reverse(currentValue.toString()))
    currentValue += reversedValue
    if (isPalindrome(currentValue.toString())) {
      return false
    }
  }
  return true
}

export function solve() {
  let count = 0
  for (let i = 0; i < 10_000; ++i) {
    if (isLychrel(i)) {
      count++
    }
  }
  return count
}
