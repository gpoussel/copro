import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input).map(line => utils.input.readNumbers(line))
}

function isSafe(input: number[]) {
  const sign = Math.sign(input[1] - input[0])
  for (let i = 1; i < input.length; ++i) {
    if ((sign === 1 && input[i] < input[i - 1]) || (sign === -1 && input[i] > input[i - 1])) {
      return false
    }
    const diff = Math.abs(input[i] - input[i - 1])
    if (diff > 3 || diff === 0) {
      return false
    }
  }
  return true
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(isSafe).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(report => {
    if (isSafe(report)) {
      return true
    }
    for (let i = 0; i < report.length; ++i) {
      const reportWithoutNumber = [...report.slice(0, i), ...report.slice(i + 1)]
      if (isSafe(reportWithoutNumber)) {
        return true
      }
    }
    return false
  }).length
}

const EXAMPLE = `
7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
