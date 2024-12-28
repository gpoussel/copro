import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 4

function parseInput(input: string) {
  return utils.input.firstLine(input).split("-").map(Number)
}

function isValidPassword(password: number) {
  const digits = utils.math.digits(password)
  const hasConsecutiveDigits = digits.some((digit, i) => digit === digits[i + 1])
  if (!hasConsecutiveDigits) {
    return false
  }
  const isIncreasing = digits.every((digit, i) => i === 0 || digit >= digits[i - 1])
  if (!isIncreasing) {
    return false
  }
  return true
}

function isValidPassword2(password: number) {
  const digits = utils.math.digits(password)
  const hasConsecutiveDigits = digits.some(
    (digit, i) => digit === digits[i + 1] && digit !== digits[i - 1] && digit !== digits[i + 2]
  )
  if (!hasConsecutiveDigits) {
    return false
  }
  const isIncreasing = digits.every((digit, i) => i === 0 || digit >= digits[i - 1])
  if (!isIncreasing) {
    return false
  }
  return true
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let count = 0
  for (let i = input[0]; i <= input[1]; i++) {
    if (isValidPassword(i)) {
      ++count
    }
  }
  return count
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let count = 0
  for (let i = input[0]; i <= input[1]; i++) {
    if (isValidPassword2(i)) {
      ++count
    }
  }
  return count
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "111111-111111",
        expected: 1,
      },
      {
        input: "223450-223450",
        expected: 0,
      },
      {
        input: "123789-123789",
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "112233-112233",
        expected: 1,
      },
      {
        input: "123444-123444",
        expected: 0,
      },
      {
        input: "111122-111122",
        expected: 1,
      },
    ],
  },
} as AdventOfCodeContest
