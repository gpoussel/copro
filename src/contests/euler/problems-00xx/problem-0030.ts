// 🧮 Project Euler - Problem 30

const FIVE_POWERS = [0, 1 ** 5, 2 ** 5, 3 ** 5, 4 ** 5, 5 ** 5, 6 ** 5, 7 ** 5, 8 ** 5, 9 ** 5]

export function solve() {
  const numbers = []
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      let sumAB = FIVE_POWERS[a] + FIVE_POWERS[b]
      let numberAB = 100000 * a + 10000 * b
      for (let c = 0; c <= 9; c++) {
        let sumABC = sumAB + FIVE_POWERS[c]
        let numberABC = numberAB + 1000 * c
        for (let d = 0; d <= 9; d++) {
          let sumABCD = sumABC + FIVE_POWERS[d]
          let numberABCD = numberABC + 100 * d
          for (let e = 0; e <= 9; e++) {
            let sumABCDE = sumABCD + FIVE_POWERS[e]
            let numberABCDE = numberABCD + 10 * e
            for (let f = 0; f <= 9; f++) {
              const sum = sumABCDE + FIVE_POWERS[f]
              const number = numberABCDE + f
              if (sum === number && number > 1) {
                numbers.push(number)
              }
            }
          }
        }
      }
    }
  }
  return numbers.reduce((acc, cur) => acc + cur, 0)
}
