import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input)
}

function getBestNDigits(line: string, count: number) {
  const digits = line.split("").map(Number)
  const n = digits.length

  let result = ""
  let digitsToFind = count
  let searchIndex = 0

  while (digitsToFind > 0 && searchIndex < n) {
    let bestDigit = -1
    let bestIndex = -1

    for (let i = searchIndex; i < n - digitsToFind + 1; i++) {
      if (digits[i] > bestDigit) {
        bestDigit = digits[i]
        bestIndex = i
      }
    }

    result += bestDigit.toString()
    digitsToFind--
    searchIndex = bestIndex + 1
  }

  return +result
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(line => getBestNDigits(line, 2)).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.map(line => getBestNDigits(line, 12)).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
987654321111111
811111111111119
234234234234278
818181911112111`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 357,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3121910778619,
      },
    ],
  },
} as AdventOfCodeContest
