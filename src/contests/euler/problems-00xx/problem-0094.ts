// 🧮 Project Euler - Problem 94

function* almostEquilateral() {
  yield [5, 5, 6]
  yield [17, 17, 16]
  let beforeLast = 5
  let last = 17
  let sign = -1
  while (true) {
    const n = 4 * last - beforeLast - 2 * sign
    yield [n, n, n - sign]
    beforeLast = last
    last = n
    sign *= -1
  }
}
export function solve() {
  let sum = 0
  for (const sides of almostEquilateral()) {
    const perimeter = sides.reduce((a, b) => a + b, 0)
    if (perimeter > 1e9) {
      break
    }
    sum += perimeter
  }
  return sum
}
