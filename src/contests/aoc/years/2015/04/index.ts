import { Md5 } from "ts-md5"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 4

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function findNumberThatGenerateHash(input: string, prefix: string) {
  let i = 1
  while (true) {
    const hash = Md5.hashAsciiStr(input + i)
    if (hash.startsWith(prefix)) {
      return i
    }
    i++
  }
}

function part1(inputString: string) {
  return findNumberThatGenerateHash(parseInput(inputString), "0".repeat(5))
}

function part2(inputString: string) {
  return findNumberThatGenerateHash(parseInput(inputString), "0".repeat(6))
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "abcdef",
        expected: 609043,
      },
      {
        input: "pqrstuv",
        expected: 1048970,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
