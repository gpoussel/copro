import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 6

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function findStartOfPacketMarker(input: string, markerLength: number): number {
  for (let i = markerLength; i <= input.length; i++) {
    const window = input.slice(i - markerLength, i)
    const uniqueChars = new Set(window)
    if (uniqueChars.size === markerLength) {
      return i
    }
  }
  throw new Error("No solution found")
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return findStartOfPacketMarker(input, 4)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return findStartOfPacketMarker(input, 14)
}

const EXAMPLE1 = "mjqjpqmgbljsphdztnvjfqwrcgsmlb"
const EXAMPLE2 = "bvwbjplbgvbhsrlpgdmjqwftvncz"
const EXAMPLE3 = "nppdvjthqldpwncqszvftbrmjlhg"
const EXAMPLE4 = "nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg"
const EXAMPLE5 = "zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw"

export default {
  part1: {
    run: part1,
    tests: [
      { input: EXAMPLE1, expected: 7 },
      { input: EXAMPLE2, expected: 5 },
      { input: EXAMPLE3, expected: 6 },
      { input: EXAMPLE4, expected: 10 },
      { input: EXAMPLE5, expected: 11 },
    ],
  },
  part2: {
    run: part2,
    tests: [
      { input: EXAMPLE1, expected: 19 },
      { input: EXAMPLE2, expected: 23 },
      { input: EXAMPLE3, expected: 23 },
      { input: EXAMPLE4, expected: 29 },
      { input: EXAMPLE5, expected: 26 },
    ],
  },
} as AdventOfCodeContest
