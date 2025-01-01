// 🧮 Project Euler - Problem 63

export function solve() {
  let count = 0
  for (let n = 1; n < 10; ++n) {
    for (let p = 1; p < 100; ++p) {
      const x = BigInt(n) ** BigInt(p)
      const length = x.toString().length
      if (length === p) {
        console.log(`n=${n}, p=${p}, x=${x}`)
        ++count
      } else if (length > p) {
        break
      }
    }
  }
  return count
}
