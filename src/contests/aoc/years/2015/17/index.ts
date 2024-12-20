import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 17

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

const TARGET = 150

function part1(inputString: string) {
  const containerSizes = parseInput(inputString)

  let count = 0
  for (let i = 1; i < 1 << containerSizes.length; i++) {
    const combination = containerSizes.filter((_, j) => i & (1 << j))
    if (combination.reduce((acc, size) => acc + size, 0) === TARGET) {
      count++
    }
  }

  return count
}

function part2(inputString: string) {
  const containerSizes = parseInput(inputString)

  const sizes = []
  for (let i = 1; i < 1 << containerSizes.length; i++) {
    const combination = containerSizes.filter((_, j) => i & (1 << j))
    if (combination.reduce((acc, size) => acc + size, 0) === TARGET) {
      sizes.push(utils.math.countSetBits(i))
    }
  }
  const minSize = utils.iterate.min(sizes)
  return sizes.filter(size => size === minSize).length
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
