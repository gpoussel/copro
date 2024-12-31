// 🧮 Project Euler - Problem 19

export function solve() {
  let count = 0
  for (let year = 1901; year <= 2000; year++) {
    for (let month = 1; month <= 12; month++) {
      if (new Date(year, month, 1).getDay() === 0) {
        count++
      }
    }
  }
  return count
}
