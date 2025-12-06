import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input)
}

function sumOfNumbersInString(lines: string[]): number {
  return lines
    .map(line => {
      const matches = line.match(/[0-9]/g)
      if (!matches) {
        return 0
      }
      const numberParts = [+matches[0]!, +matches[matches.length - 1]!]
      return numberParts[0] * 10 + numberParts[1]
    })
    .reduce((a, b) => a + b, 0)
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  return sumOfNumbersInString(lines)
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  // Keep first and last char to handle overlapping cases like "eightwo" -> "e8t2o"
  const formattedLines = lines.map(line =>
    line
      .replace(/one/g, "o1e")
      .replace(/two/g, "t2o")
      .replace(/three/g, "t3e")
      .replace(/four/g, "f4r")
      .replace(/five/g, "f5e")
      .replace(/six/g, "s6x")
      .replace(/seven/g, "s7n")
      .replace(/eight/g, "e8t")
      .replace(/nine/g, "n9e")
  )
  return sumOfNumbersInString(formattedLines)
}

const EXAMPLE1 = `
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`

const EXAMPLE2 = `
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 142,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 142,
      },
      {
        input: EXAMPLE2,
        expected: 281,
      },
    ],
  },
} as AdventOfCodeContest
