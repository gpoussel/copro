import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [l, w, h] = line.split("x").map(Number)
    return { l, w, h }
  })
}

function part1(inputString: string) {
  const presentSizes = parseInput(inputString)
  return presentSizes.reduce((acc, { l, w, h }) => {
    const sides = [l * w, w * h, h * l]
    const smallestSide = Math.min(...sides)
    return acc + 2 * sides.reduce((acc, side) => acc + side, 0) + smallestSide
  }, 0)
}

function part2(inputString: string) {
  const presentSizes = parseInput(inputString)
  return presentSizes.reduce((acc, { l, w, h }) => {
    const sides = [l, w, h].sort((a, b) => a - b)
    return acc + 2 * (sides[0] + sides[1]) + l * w * h
  }, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "2x3x4",
        expected: 58,
      },
      {
        input: "1x1x10",
        expected: 43,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "2x3x4",
        expected: 34,
      },
      {
        input: "1x1x10",
        expected: 14,
      },
    ],
  },
} as AdventOfCodeContest
