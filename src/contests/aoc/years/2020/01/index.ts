import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const numbers = parseInput(inputString)
  for (let i = 0; i < numbers.length; ++i) {
    for (let j = i + 1; j < numbers.length; ++j) {
      if (numbers[i] + numbers[j] === 2020) {
        return numbers[i] * numbers[j]
      }
    }
  }
}

function part2(inputString: string) {
  const numbers = parseInput(inputString)
  for (let i = 0; i < numbers.length; ++i) {
    for (let j = i + 1; j < numbers.length; ++j) {
      for (let k = j + 1; k < numbers.length; ++k) {
        if (numbers[i] + numbers[j] + numbers[k] === 2020) {
          return numbers[i] * numbers[j] * numbers[k]
        }
      }
    }
  }
}

const EXAMPLE = `
1721
979
366
299
675
1456`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 514579,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 241861950,
      },
    ],
  },
} as AdventOfCodeContest
