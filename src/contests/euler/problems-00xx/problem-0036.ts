// 🧮 Project Euler - Problem 36

function isPalindrome(str: string) {
  return str === str.split("").reverse().join("")
}

export function solve() {
  let sum = 0
  for (let i = 1; i < 1_000_000; i += 2) {
    if (isPalindrome(i.toString(10)) && isPalindrome(i.toString(2))) {
      sum += i
    }
  }
  return sum
}