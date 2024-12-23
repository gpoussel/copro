import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  return parseInput(inputString).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const numbers = parseInput(inputString)
  const seen = new Set<number>()
  let position = 0
  while (true) {
    for (const number of numbers) {
      position += number
      if (seen.has(position)) {
        return position
      }
      seen.add(position)
    }
  }
}

const EXAMPLE = `+1
-2
+3
+1`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
} as AdventOfCodeContest
