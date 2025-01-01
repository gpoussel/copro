import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 33

function isCuriousFraction(a: number, b: number) {
  if (a % 10 === 0 && b % 10 === 0) return false
  const fraction = a / b
  const aDigits = a.toString().split("")
  const bDigits = b.toString().split("")
  const commonDigits = utils.iterate.intersectionBy(aDigits, bDigits, d => d)
  for (const commonDigit of commonDigits) {
    const aReducedDigits = aDigits.filter(d => d !== commonDigit)
    const bReducedDigits = bDigits.filter(d => d !== commonDigit)
    if (aReducedDigits.length === 0 || bReducedDigits.length === 0) continue
    const simplifiedFraction = +aReducedDigits.join("") / +bReducedDigits.join("")
    if (fraction === simplifiedFraction) {
      return true
    }
  }
  return false
}

export function solve() {
  const fractions = []
  for (let a = 10; a < 100; a++) {
    for (let b = a + 1; b < 100; b++) {
      if (isCuriousFraction(a, b)) {
        fractions.push([a, b])
      }
    }
  }
  const product = fractions.reduce((acc, cur) => [acc[0] * cur[0], acc[1] * cur[1]], [1, 1])
  const factor = utils.math.gcd(product[0], product[1])
  return product[1] / factor
}
