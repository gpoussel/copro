import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 1

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString).split("")
  return utils.iterate.count(input, "(") - utils.iterate.count(input, ")")
}

function part2(inputString: string) {
  const input = parseInput(inputString).split("")
  let floor = 0
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "(") {
      floor++
    } else {
      floor--
    }
    if (floor === -1) {
      return i + 1
    }
  }
  return Infinity
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "(())",
        expected: 0,
      },
      {
        input: "))(((((",
        expected: 3,
      },
      {
        input: "())",
        expected: -1,
      },
      {
        input: ")))",
        expected: -3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: ")",
        expected: 1,
      },
      {
        input: "()())",
        expected: 5,
      },
    ],
  },
} as AdventOfCodeContest
