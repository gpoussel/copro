import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 8

function parseInput(input: string) {
  return utils.input.lines(input)
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  return lines.map(line => line.length - eval(line).length).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  return lines.map(line => JSON.stringify(line).length - line.length).reduce((a, b) => a + b, 0)
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `"aaa\\"aaa"`,
        expected: 3,
      },
      {
        input: `"\\x27"`,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `"aaa\\"aaa"`,
        expected: 6,
      },
      {
        input: `"\\x27"`,
        expected: 5,
      },
    ],
  },
} as AdventOfCodeContest
