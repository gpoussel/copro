import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input).join("")
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .match(/mul\((\d+),(\d+)\)/g)
    ?.map(match => {
      const [a, b] = match.match(/\d+/g)!.map(Number)
      return a * b
    })
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .replace(/don't\(\).*?do\(\)/g, "")
    .replace(/don't\(\).*/g, "")
    .match(/mul\((\d+),(\d+)\)/g)
    ?.map(match => {
      const [a, b] = match.match(/\d+/g)!.map(Number)
      return a * b
    })
    .reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))`,
        expected: 161,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))`,
        expected: 48,
      },
    ],
  },
} as AdventOfCodeContest
