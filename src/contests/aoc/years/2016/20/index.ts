import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 20

function parseInput(input: string) {
  const ranges = utils.input.lines(input).map(line => line.split("-").map(Number))
  return ranges.sort((a, b) => a[0] - b[0])
}

const MAX = 4294967295

function part1(inputString: string) {
  const ranges = parseInput(inputString)
  let i = 0
  let rangePtr = 0
  while (rangePtr < ranges.length) {
    if (i < ranges[rangePtr][0]) {
      return i
    }
    i = Math.max(i, ranges[rangePtr][1] + 1)
    ++rangePtr
  }
}

function part2(inputString: string) {
  const ranges = parseInput(inputString)
  let i = 0
  let rangePtr = 0
  let count = 0
  while (rangePtr < ranges.length) {
    if (i < ranges[rangePtr][0]) {
      count += ranges[rangePtr][0] - i
    }
    i = Math.max(i, ranges[rangePtr][1] + 1)
    ++rangePtr
  }
  count += MAX - i + 1
  return count
}

const EXAMPLE = `
5-8
0-2
4-7`

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
        expected: 4294967288,
      },
    ],
  },
} as AdventOfCodeContest
