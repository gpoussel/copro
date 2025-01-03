import { DIGIT_SQUARES, digits } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 92

export function solve() {
  const endNumber = new Array<number>(10_000_000).fill(0)
  endNumber[1] = 1
  endNumber[89] = 89
  for (let i = 1; i < 10_000_000; ++i) {
    const history = [i]
    while (endNumber[history[history.length - 1]] === 0) {
      history.push(digits(history[history.length - 1]).reduce((acc, digit) => acc + DIGIT_SQUARES[digit], 0))
    }
    history.forEach(number => (endNumber[number] = endNumber[history[history.length - 1]]))
  }
  return endNumber.filter(number => number === 89).length
}
