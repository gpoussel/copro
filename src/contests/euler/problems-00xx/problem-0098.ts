import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { combinations, mapBy, permutations } from "../../../utils/iterate.js"

// 🧮 Project Euler - Problem 98

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0098_words.txt")
  const dictionary = readFileSync(filePath, "utf-8")
    .trim()
    .split(",")
    .map(w => w.slice(1, -1))

  let largestNumber = 0

  // Only words of the same length can be anagrams
  const wordsByLength = mapBy(dictionary, w => w.length)
  for (const [length, words] of wordsByLength) {
    for (let i = 0; i < words.length; i++) {
      const word1 = words[i]
      for (let j = i + 1; j < words.length; ++j) {
        const word2 = words[j]
        const word1Sorted = word1.split("").sort().join("")
        const word2Sorted = word2.split("").sort().join("")
        if (word1Sorted !== word2Sorted) {
          // Words are not anagrams
          continue
        }
        const numberOfDistinctLetters = new Set(word1).size
        const letters = [...new Set(word1)]
        for (const combination of combinations([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], numberOfDistinctLetters)) {
          for (const permutation of permutations(combination)) {
            const number1String = word1
              .split("")
              .map(c => permutation[letters.indexOf(c)])
              .join("")
            const number2String = word2
              .split("")
              .map(c => permutation[letters.indexOf(c)])
              .join("")
            if (number1String.startsWith("0") || number2String.startsWith("0")) {
              // No leading zeros
              continue
            }
            const number1 = +number1String
            const number2 = +number2String
            if (Number.isInteger(Math.sqrt(number1)) && Number.isInteger(Math.sqrt(number2))) {
              largestNumber = Math.max(largestNumber, number1, number2)
            }
          }
        }
      }
    }
  }
  return largestNumber
}
