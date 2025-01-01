// 🧮 Project Euler - Problem 32

function isPandigital(a: number, b: number) {
  const product = a * b
  const digits = `${a}${b}${product}`
  if (digits.length !== 9) return false
  if (digits.includes("0")) return false
  return new Set(digits).size === 9
}

export function solve() {
  const pandigitals = new Set<number>()
  for (let a = 2; a < 1000; a++) {
    for (let b = a; b < 10000; b++) {
      if (isPandigital(a, b)) {
        pandigitals.add(a * b)
      }
    }
  }
  return Array.from(pandigitals).reduce((acc, cur) => acc + cur, 0)
}
