// 🧮 Project Euler - Problem 16

export function solve() {
  return (2n ** 1000n)
    .toString()
    .split("")
    .reduce((acc, cur) => acc + +cur, 0)
}
