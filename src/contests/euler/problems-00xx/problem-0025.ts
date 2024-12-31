// 🧮 Project Euler - Problem 25

export function solve() {
  let fib = [1n, 2n]
  let index = 3
  while (fib[1].toString().length < 1000) {
    fib = [fib[1], fib[0] + fib[1]]
    ++index
  }
  return index
}
