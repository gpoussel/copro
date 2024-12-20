import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 12

function parseInput(input: string) {
  return input
}

function sum(obj: any): number {
  if (typeof obj === "number") {
    return obj
  } else if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.reduce((acc, item) => acc + sum(item), 0)
    } else {
      if (Object.values(obj).includes("red")) {
        return 0
      }
      return Object.values(obj).reduce((acc: number, item) => acc + sum(item), 0)
    }
  }
  return 0
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.match(/-?\d+/g)?.reduce((acc, num) => acc + +num, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return sum(JSON.parse(input))
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `{"a":2,"b":4}`,
        expected: 6,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `{"d":"red","e":[1,2,3,4],"f":5}`,
        expected: 0,
      },
    ],
  },
} as AdventOfCodeContest
