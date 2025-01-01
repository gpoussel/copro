// 🧮 Project Euler - Problem 31

export function solve() {
  const combinations = Array.from({ length: 201 }, () => 0)
  combinations[0] = 1
  for (const coin of [1, 2, 5, 10, 20, 50, 100, 200]) {
    for (let i = coin; i <= 200; i++) {
      combinations[i] += combinations[i - coin]
    }
  }
  return combinations[200]
}
