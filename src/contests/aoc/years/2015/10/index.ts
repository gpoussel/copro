import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 10

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function applyProcess(input: string) {
  let result = ""
  for (let i = 0; i < input.length; ++i) {
    let char = input[i]
    let j = 1
    while (j < input.length && input[i + j] === char) {
      j++
    }
    i += j - 1
    result += `${j}${char}`
  }
  return result
}

function getLengthAfterIterations(input: string, iterations: number) {
  let result = input
  for (let i = 0; i < iterations; ++i) {
    result = applyProcess(result)
  }
  return result.length
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return getLengthAfterIterations(input, 40)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return getLengthAfterIterations(input, 50)
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
