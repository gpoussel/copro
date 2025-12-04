import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const depths = parseInput(inputString)
  let increaseCount = 0
  for (let i = 1; i < depths.length; i++) {
    if (depths[i] > depths[i - 1]) {
      increaseCount++
    }
  }
  return increaseCount
}

function part2(inputString: string) {
  const depths = parseInput(inputString)
  let increaseCount = 0
  for (let i = 3; i < depths.length; i++) {
    const prevSum = depths[i - 1] + depths[i - 2] + depths[i - 3]
    const currSum = depths[i] + depths[i - 1] + depths[i - 2]
    if (currSum > prevSum) {
      increaseCount++
    }
  }
  return increaseCount
}

const EXAMPLE = `
199
200
208
210
200
207
240
269
260
263`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
