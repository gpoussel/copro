import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 9

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  for (let i = 25; i < input.length; i++) {
    const num = input[i]
    let found = false
    for (let j = i - 25; j < i; j++) {
      for (let k = j + 1; k < i; k++) {
        if (input[j] + input[k] === num) {
          found = true
          break
        }
      }
      if (found) {
        break
      }
    }
    if (!found) {
      return num
    }
  }
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const target = part1(inputString)!
  for (let i = 0; i < input.length; i++) {
    let sum = input[i]
    for (let j = i + 1; j < input.length; j++) {
      sum += input[j]
      if (sum === target) {
        const numbersInSum = input.slice(i, j + 1)
        return Math.min(...numbersInSum) + Math.max(...numbersInSum)
      }
      if (sum > target) {
        break
      }
    }
  }
  return
}

const EXAMPLE = ``

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
