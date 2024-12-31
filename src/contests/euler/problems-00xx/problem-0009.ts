// 🧮 Project Euler - Problem 9

export function solve() {
  for (let a = 1; a < 900; a++) {
    for (let b = 1; b < 1000 - a - 1; b++) {
      const c = 1000 - a - b
      if (a ** 2 + b ** 2 === c ** 2) {
        return a * b * c
      }
    }
  }
}
