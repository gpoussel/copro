// 🧮 Project Euler - Problem 26

function getCycleLength(n: number) {
  const remainders: number[] = []
  let remainder = 1
  while (true) {
    remainder = (remainder * 10) % n
    if (remainders.includes(remainder)) {
      return remainders.length - remainders.indexOf(remainder)
    }
    remainders.push(remainder)
  }
}

export function solve() {
  let maxCycleLength = 0
  let maxCycleLengthNumber = 0
  for (let i = 2; i < 1000; ++i) {
    const cycleLength = getCycleLength(i)
    if (cycleLength > maxCycleLength) {
      maxCycleLength = cycleLength
      maxCycleLengthNumber = i
    }
  }
  return maxCycleLengthNumber
}
