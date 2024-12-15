import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 4

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const min = Math.min(...input)
  return input.map(value => value - min).reduce((acc, value) => acc + value, 0)
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const min = Math.min(...input)
  const max = Math.max(...input)
  let minSum = Infinity
  for (let target = min; target <= max; target++) {
    const sum = input.map(value => Math.abs(value - target)).reduce((acc, value) => acc + value, 0)
    if (sum < minSum) {
      minSum = sum
    }
  }
  return minSum
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
3
4
7
8`,
        expected: 10,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
2
4
5
6
8`,
        expected: 8,
      },
    ],
  },
} as EverybodyCodesContest
