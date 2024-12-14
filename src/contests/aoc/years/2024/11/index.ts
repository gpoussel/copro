import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 11

function parseInput(input: string) {
  return utils.input.readNumbers(input)
}

const cache: number[][] = []

function blink(stone: number) {
  if (stone === 0) {
    return [1]
  }
  const stoneString = `${stone}`
  if (stoneString.length % 2 === 0) {
    const halfLength = stoneString.length / 2
    return [parseInt(stoneString.substring(0, halfLength), 10), parseInt(stoneString.substring(halfLength), 10)]
  }
  return [stone * 2024]
}

function iterateNumber(n: number, steps: number): number {
  if (!cache[steps]) {
    cache[steps] = []
  }
  if (!cache[steps][n]) {
    cache[steps][n] =
      steps == 0
        ? 1
        : blink(n)
            .map(n => iterateNumber(n, steps - 1))
            .reduce((a, b) => a + b, 0)
  }
  return cache[steps][n]
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(n => iterateNumber(n, 25)).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.map(n => iterateNumber(n, 75)).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
125 17
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 55312,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
