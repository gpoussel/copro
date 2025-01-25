import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 5

function parseInput(input: string) {
  return utils.input.lines(input)
}

function getValue(str: string) {
  const row = parseInt(str.slice(0, 7).replace(/F/g, "0").replace(/B/g, "1"), 2)
  const col = parseInt(str.slice(7).replace(/L/g, "0").replace(/R/g, "1"), 2)
  return row * 8 + col
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return utils.iterate.max(input.map(getValue))
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const seatIds = input.map(getValue).sort((a, b) => a - b)
  for (let i = 0; i < seatIds.length - 1; i++) {
    if (seatIds[i + 1] - seatIds[i] === 2) {
      return seatIds[i] + 1
    }
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "FBFBBFFRLR",
        expected: 357,
      },
      {
        input: "BFFFBBFRRR",
        expected: 567,
      },
      {
        input: "FFFBBBFRRR",
        expected: 119,
      },
      {
        input: "BBFFBBFRLL",
        expected: 820,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
