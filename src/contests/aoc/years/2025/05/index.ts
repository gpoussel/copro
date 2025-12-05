import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 5

function parseInput(input: string) {
  const [ranges, numbers] = utils.input.blocks(input)
  const parsedRanges = utils.input
    .lines(ranges)
    .map(line => {
      const [start, end] = line.split("-").map(Number)
      return { start, end }
    })
    .sort((a, b) => a.start - b.start)
  const parsedNumbers = utils.input.lines(numbers).map(Number)
  return { ranges: parsedRanges, numbers: parsedNumbers }
}

function part1(inputString: string) {
  const { ranges, numbers } = parseInput(inputString)
  let count = 0
  for (const number of numbers) {
    for (const range of ranges) {
      if (number >= range.start && number <= range.end) {
        count++
        break
      } else if (number < range.start) {
        break
      }
    }
  }
  return count
}

function part2(inputString: string) {
  const { ranges } = parseInput(inputString)
  const normalizedRanges = []
  for (const range of ranges) {
    const lastRange = normalizedRanges[normalizedRanges.length - 1]
    if (lastRange && range.start <= lastRange.end + 1) {
      lastRange.end = Math.max(lastRange.end, range.end)
    } else {
      normalizedRanges.push({ ...range })
    }
  }
  return normalizedRanges.map(r => r.end - r.start + 1).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
3-5
10-14
16-20
12-18

1
5
8
11
17
32`

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
        expected: 14,
      },
    ],
  },
} as AdventOfCodeContest
