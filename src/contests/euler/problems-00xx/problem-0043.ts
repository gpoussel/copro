import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 43

function isSpecial(digits: number[]) {
  if (digits[3] % 2 !== 0) {
    return false
  }
  if (digits[5] % 5 !== 0) {
    return false
  }
  if (+digits.slice(7, 10).join("") % 17 !== 0) {
    return false
  }
  if (+digits.slice(6, 9).join("") % 13 !== 0) {
    return false
  }
  if (+digits.slice(5, 8).join("") % 11 !== 0) {
    return false
  }
  if (+digits.slice(4, 7).join("") % 7 !== 0) {
    return false
  }
  if (+digits.slice(2, 5).join("") % 3 !== 0) {
    return false
  }
  return true
}

export function solve() {
  let sum = 0
  const digits = Array.from({ length: 10 }, (_, i) => i)
  const permutations = utils.iterate.permutations(digits)
  for (const permutation of permutations) {
    if (isSpecial(permutation)) {
      sum += +permutation.join("")
    }
  }
  return sum
}
