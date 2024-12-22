import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 19

function parseInput(input: string) {
  return +utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  // It is Josephus problem
  return parseInt(input.toString(2).substring(1) + "1", 2)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  // It is a variant of Josephus problem
  let i = 1
  while (3 ** i <= input) {
    i += 1
  }
  const current = 3 ** (i - 1) + 1
  const inc2 = Math.floor((3 ** i * 2) / 3)
  return Math.max(2 * (input - inc2), 0) + (Math.min(input, inc2) - current) + 1
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "5",
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
