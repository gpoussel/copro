import { ProjectEulerProblem } from "../../../types/contest.js"

// 🧮 Project Euler - Problem 4

function isPalindrome(n: number) {
  return n
    .toString()
    .split("")
    .every((d, i, arr) => d === arr[arr.length - i - 1])
}

export function solve() {
  let largestPalindrome = 0
  for (let i = 999; i >= 100; i--) {
    for (let j = i; j >= 100; j--) {
      const product = i * j
      if (isPalindrome(product) && product > largestPalindrome) {
        largestPalindrome = product
      }
    }
  }
  return largestPalindrome
}
