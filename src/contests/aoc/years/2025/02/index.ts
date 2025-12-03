import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 2

function parseInput(input: string) {
  return input.split(",").map(interval => interval.split("-").map(Number))
}

function findInvalidIdsByAny(start: number, end: number, sizes: (_: number) => number[]) {
  let sum = 0
  for (let id = start; id <= end; id++) {
    const idStr = id.toString()
    const len = idStr.length
    for (const size of sizes(len)) {
      if (len % size === 0) {
        const part = idStr.slice(0, size)
        if (part.repeat(len / size) === idStr) {
          sum += id
          break
        }
      }
    }
  }
  return sum
}

function part1(inputString: string) {
  return parseInput(inputString)
    .map(([start, end]) => findInvalidIdsByAny(start, end, len => [len / 2]))
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  return parseInput(inputString)
    .map(([start, end]) =>
      findInvalidIdsByAny(start, end, len => utils.iterate.range(1, len / 2 + 1).filter(size => len % size === 0))
    )
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE = `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1227775554,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 4174379265,
      },
    ],
  },
} as AdventOfCodeContest
