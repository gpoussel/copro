import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function getFuel(mass: number) {
  return Math.max(0, Math.floor(mass / 3) - 2)
}

function getFuelRecursive(n: number): number {
  const fuel = getFuel(n)
  if (fuel <= 0) {
    return 0
  }
  return fuel + getFuelRecursive(fuel)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(getFuel).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.map(getFuelRecursive).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
12
14
1969
100756`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 34241,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 51316,
      },
    ],
  },
} as AdventOfCodeContest
