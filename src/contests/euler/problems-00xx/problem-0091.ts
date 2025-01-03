// 🧮 Project Euler - Problem 91

export function solve() {
  let count = 0
  for (let x1 = 0; x1 <= 50; ++x1) {
    for (let y1 = 0; y1 <= 50; ++y1) {
      const a = x1 * x1 + y1 * y1
      for (let x2 = 0; x2 <= 50; ++x2) {
        for (let y2 = 0; y2 <= 50; ++y2) {
          if (x1 === 0 && y1 === 0) continue
          if (x2 === 0 && y2 === 0) continue
          if (x1 === x2 && y1 === y2) continue
          if (y1 - x1 >= y2 - x2) continue
          const b = x2 * x2 + y2 * y2
          const dx = x1 - x2
          const dy = y1 - y2
          const c = dx * dx + dy * dy
          if (a + b === c || a + c === b || b + c === a) {
            ++count
          }
        }
      }
    }
  }

  return count
}
