import {
  digits,
  heptagonalNumbers,
  hexagonalNumbers,
  octagonalNumbers,
  pentagonalNumbers,
  squareNumbers,
  triangleNumbers,
} from "../../../utils/math.js"

// 🧮 Project Euler - Problem 61

export function solve() {
  const triangles = triangleNumbers(1000)
  const squares = squareNumbers(1000)
  const pentagonals = pentagonalNumbers(1000)
  const hexagonals = hexagonalNumbers(1000)
  const heptagonals = heptagonalNumbers(1000)
  const octagonals = octagonalNumbers(1000)

  const lists = [triangles, squares, pentagonals, hexagonals, heptagonals]

  for (const octagonal of octagonals) {
    if (octagonal < 1000 || octagonal >= 10000 || digits(octagonal).includes(0)) continue
    const octagonalLastDigits = octagonal % 100
    for (const list1 of lists) {
      for (const number1 of list1) {
        if (number1 < 1000 || number1 >= 10000 || digits(number1).includes(0)) continue
        const number1FirstDigits = Math.floor(number1 / 100)
        if (number1FirstDigits !== octagonalLastDigits) continue
        const number1LastDigits = number1 % 100
        for (const list2 of lists.filter(l => l !== list1)) {
          for (const number2 of list2) {
            if (number2 < 1000 || number2 >= 10000 || digits(number2).includes(0)) continue
            const number2FirstDigits = Math.floor(number2 / 100)
            if (number2FirstDigits !== number1LastDigits) continue
            const number2LastDigits = number2 % 100
            for (const list3 of lists.filter(l => l !== list1 && l !== list2)) {
              for (const number3 of list3) {
                if (number3 < 1000 || number3 >= 10000 || digits(number3).includes(0)) continue
                const number3FirstDigits = Math.floor(number3 / 100)
                if (number3FirstDigits !== number2LastDigits) continue
                const number3LastDigits = number3 % 100
                for (const list4 of lists.filter(l => l !== list1 && l !== list2 && l !== list3)) {
                  for (const number4 of list4) {
                    if (number4 < 1000 || number4 >= 10000 || digits(number4).includes(0)) continue
                    const number4FirstDigits = Math.floor(number4 / 100)
                    if (number4FirstDigits !== number3LastDigits) continue
                    const number4LastDigits = number4 % 100
                    for (const list5 of lists.filter(l => l !== list1 && l !== list2 && l !== list3 && l !== list4)) {
                      for (const number5 of list5) {
                        if (number5 < 1000 || number5 >= 10000 || digits(number5).includes(0)) continue
                        const number5FirstDigits = Math.floor(number5 / 100)
                        if (number5FirstDigits !== number4LastDigits) continue
                        const number5LastDigits = number5 % 100
                        const octagonalFirstDigits = Math.floor(octagonal / 100)
                        if (number5LastDigits === octagonalFirstDigits) {
                          return octagonal + number1 + number2 + number3 + number4 + number5
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
