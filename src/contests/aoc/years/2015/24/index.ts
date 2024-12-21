import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { combinations } from "../../../../../utils/iterate.js"

// 🎄 Advent of Code 2015 - Day 24

function parseInput(input: string) {
  return utils.input
    .lines(input)
    .map(Number)
    .sort((a, b) => a - b)
}

function solve(input: number[], numberOfGroups: number) {
  const sum = input.reduce((a, b) => a + b, 0)
  const targetSum = sum / numberOfGroups

  let maxNumberOfPackages = 0
  while (input.slice(0, maxNumberOfPackages + 1).reduce((a, b) => a + b, 0) < targetSum) {
    maxNumberOfPackages++
  }

  let minNumberOfPackages = 0
  while (
    input
      .reverse()
      .slice(0, minNumberOfPackages + 1)
      .reduce((a, b) => a + b, 0) < targetSum
  ) {
    minNumberOfPackages++
  }
  for (let numberOfPackges = minNumberOfPackages; numberOfPackges <= maxNumberOfPackages; numberOfPackges++) {
    const possibilities = [...combinations(input, numberOfPackges)].map(combination => ({
      combination,
      sum: combination.reduce((a, b) => a + b, 0),
    }))
    const validPosibilities = possibilities.filter(({ sum }) => sum === targetSum)
    if (validPosibilities.length > 0) {
      const quantumEntanglements = validPosibilities.map(({ combination }) => combination.reduce((a, b) => a * b, 1))
      return utils.iterate.min(quantumEntanglements)
    }
  }
}

function part1(inputString: string) {
  return solve(parseInput(inputString), 3)
}

function part2(inputString: string) {
  return solve(parseInput(inputString), 4)
}

const EXAMPLE = `
1
2
3
4
5
7
8
9
10
11`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 99,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 44,
      },
    ],
  },
} as AdventOfCodeContest
