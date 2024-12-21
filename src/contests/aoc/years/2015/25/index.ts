import { AdventOfCodeContest } from "../../../../../types/contest.js"

// 🎄 Advent of Code 2015 - Day 25

function parseInput(input: string) {
  const coordinates = input.match(/\d+/g)!.map(Number)
  return {
    row: coordinates[0],
    column: coordinates[1],
  }
}

const MULTIPLIER = 252_533
const DIVIDER = 33_554_393

function part1(inputString: string) {
  const input = parseInput(inputString)
  let value = 20_151_125
  let row = 1
  let column = 1
  while (row !== input.row || column !== input.column) {
    value = (value * MULTIPLIER) % DIVIDER
    if (row === 1) {
      row = column + 1
      column = 1
    } else {
      row--
      column++
    }
  }
  return value
}

function part2() {
  return "Merry Christmas!"
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
