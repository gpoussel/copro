import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 17

function parseInput(input: string) {
  return utils.input.number(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const buffer = [0]
  let position = 0
  for (let i = 1; i <= 2017; i++) {
    position = ((position + input) % buffer.length) + 1
    buffer.splice(position, 0, i)
    utils.log.logEvery(i, 100_000)
  }
  const positionOfTarget = buffer.indexOf(2017)
  return buffer[(positionOfTarget + 1) % buffer.length]
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let position = 0
  let nextToZero = 1
  for (let i = 1; i <= 50_000_000; i++) {
    position = ((position + input) % i) + 1
    if (position === 1) nextToZero = i
  }
  return nextToZero
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "3",
        expected: 638,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
