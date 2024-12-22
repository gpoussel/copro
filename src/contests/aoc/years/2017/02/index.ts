import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input).map(line => line.split(/\s+/).map(Number))
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(row => ({
      min: Math.min(...row),
      max: Math.max(...row),
    }))
    .map(({ min, max }) => max - min)
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(row => {
      for (let i = 0; i < row.length; ++i) {
        for (let j = 0; j < row.length; ++j) {
          if (i !== j && row[i] % row[j] === 0) {
            return row[i] / row[j]
          }
        }
      }
      return Infinity
    })
    .reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
5 1 9 5
7 5 3
2 4 6 8`,
        expected: 18,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
5 9 2 8
9 4 7 3
3 8 6 5`,
        expected: 9,
      },
    ],
  },
} as AdventOfCodeContest
