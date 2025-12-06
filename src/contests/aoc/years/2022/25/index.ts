import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 25

function parseInput(input: string) {
  return utils.input.lines(input)
}

const SNAFU_DIGITS: Record<string, number> = {
  "=": -2,
  "-": -1,
  "0": 0,
  "1": 1,
  "2": 2,
}

const DIGIT_TO_SNAFU: Record<number, string> = {
  [-2]: "=",
  [-1]: "-",
  0: "0",
  1: "1",
  2: "2",
}

function snafuToDecimal(snafu: string): number {
  let result = 0
  let power = 1
  for (let i = snafu.length - 1; i >= 0; i--) {
    result += SNAFU_DIGITS[snafu[i]] * power
    power *= 5
  }
  return result
}

function decimalToSnafu(decimal: number): string {
  if (decimal === 0) return "0"

  const digits: string[] = []

  while (decimal !== 0) {
    // Get remainder in range 0-4
    let remainder = decimal % 5
    decimal = Math.floor(decimal / 5)

    // Adjust for SNAFU: if remainder > 2, we need to use negative digits
    if (remainder > 2) {
      remainder -= 5
      decimal += 1 // Carry
    }

    digits.push(DIGIT_TO_SNAFU[remainder])
  }

  return digits.reverse().join("")
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const sum = input.reduce((acc, line) => acc + snafuToDecimal(line), 0)
  return decimalToSnafu(sum)
}

function part2(inputString: string) {
  return "Merry Christmas!"
}

const EXAMPLE = `
1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "2=-1=0",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
