import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 1

function parseInput(input: string) {
  return utils.input
    .lines(input)
    .map(line => utils.input.readNumbers(line))
    .map(([x, y]) => ({ x, y }))
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const left = input.map(({ x }) => x).sort()
  const right = input.map(({ y }) => y).sort()
  return Array.from({ length: input.length }, (_, i) => Math.abs(left[i] - right[i])).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const left = input.map(({ x }) => x)
  const right = input.map(({ y }) => y)
  return left.map(x => x * utils.iterate.count(right, x)).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
3   4
4   3
2   5
1   3
3   9
3   3
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 11,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 31,
      },
    ],
  },
} as AdventOfCodeContest
