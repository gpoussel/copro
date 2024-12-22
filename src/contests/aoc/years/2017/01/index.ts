import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 1

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .split("")
    .filter((c, i, arr) => c === arr[(i + 1) % arr.length])
    .map(Number)
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .split("")
    .filter((c, i, arr) => c === arr[(i + arr.length / 2) % arr.length])
    .map(Number)
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "1122",
        expected: 3,
      },
      {
        input: "1111",
        expected: 4,
      },
      {
        input: "1234",
        expected: 0,
      },
      {
        input: "91212129",
        expected: 9,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "1212",
        expected: 6,
      },
      {
        input: "1221",
        expected: 0,
      },
      {
        input: "123425",
        expected: 4,
      },
      {
        input: "123123",
        expected: 12,
      },
      {
        input: "12131415",
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
