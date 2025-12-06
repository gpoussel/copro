import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input)
}

function getPriority(char: string): number {
  const code = char.charCodeAt(0)
  if (char >= "a" && char <= "z") {
    return code - "a".charCodeAt(0) + 1
  } else if (char >= "A" && char <= "Z") {
    return code - "A".charCodeAt(0) + 27
  }
  throw new Error(`Invalid character for priority: ${char}`)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let sumOfPriorities = 0
  for (const line of input) {
    const part1 = line.slice(0, line.length / 2)
    const part2 = line.slice(line.length / 2)
    const part2Letters = new Set(part2.split(""))
    for (const char of part1) {
      if (part2Letters.has(char)) {
        sumOfPriorities += getPriority(char)
        break
      }
    }
  }
  return sumOfPriorities
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  let sumOfPriorities = 0
  for (let i = 0; i < input.length; i += 3) {
    const line1 = input[i]
    const line2 = input[i + 1]
    const line3 = input[i + 2]
    const line2Letters = new Set(line2.split(""))
    const line3Letters = new Set(line3.split(""))
    for (const char of line1) {
      if (line2Letters.has(char) && line3Letters.has(char)) {
        sumOfPriorities += getPriority(char)
        break
      }
    }
  }
  return sumOfPriorities
}

const EXAMPLE = `
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 157,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 70,
      },
    ],
  },
} as AdventOfCodeContest
