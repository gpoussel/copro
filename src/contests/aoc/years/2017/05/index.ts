import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 5

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let i = 0
  let steps = 0
  while (i >= 0 && i < input.length) {
    const offset = input[i]
    input[i]++
    i += offset
    ++steps
  }
  return steps
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let i = 0
  let steps = 0
  while (i >= 0 && i < input.length) {
    const offset = input[i]
    if (input[i] >= 3) {
      input[i]--
    } else {
      input[i]++
    }
    i += offset
    ++steps
  }
  return steps
}

const EXAMPLE = `
0
3
0
1
-3`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 10,
      },
    ],
  },
} as AdventOfCodeContest
