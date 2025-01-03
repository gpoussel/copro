import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 90

function includesLenient(dice: number[], digit: number) {
  return dice.includes(digit) || (digit === 9 && dice.includes(6)) || (digit === 6 && dice.includes(9))
}

export function solve() {
  const squaresBelowOneHundred = [1, 4, 9, 16, 25, 36, 49, 64, 81]
  const constraints = squaresBelowOneHundred
    .map(square => square.toString().padStart(2, "0"))
    .map(square => square.split(""))
    .map(square => square.map(digit => parseInt(digit)))

  const pairs = new Set<string>()
  for (const dice1 of utils.iterate.combinations([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 6)) {
    for (const dice2 of utils.iterate.combinations([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 6)) {
      if (
        constraints.every(
          constraint =>
            (includesLenient(dice1, constraint[0]) && includesLenient(dice2, constraint[1])) ||
            (includesLenient(dice1, constraint[1]) && includesLenient(dice2, constraint[0]))
        )
      ) {
        const key1 = dice1.join("") + dice2.join("")
        const key2 = dice2.join("") + dice1.join("")
        if (!pairs.has(key1) && !pairs.has(key2)) {
          pairs.add(key1)
        }
      }
    }
  }
  return pairs.size
}
