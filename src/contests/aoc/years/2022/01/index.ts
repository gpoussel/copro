import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 1

function parseInput(input: string) {
  return utils.input.blocks(input).map(block => utils.input.lines(block).map(line => +line))
}

function part1(inputString: string) {
  const elves = parseInput(inputString)
  const sumOfCalories = elves.map(elf => elf.reduce((a, b) => a + b, 0))
  return utils.iterate.max(sumOfCalories)
}

function part2(inputString: string) {
  const elves = parseInput(inputString)
  const sumOfCalories = elves.map(elf => elf.reduce((a, b) => a + b, 0)).sort((a, b) => b - a)
  return sumOfCalories.slice(0, 3).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 24000,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 45000,
      },
    ],
  },
} as AdventOfCodeContest
