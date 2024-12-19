import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 5

function parseInput(input: string) {
  return utils.input.lines(input)
}

function isNicePart1(word: string) {
  const vowels = word.match(/[aeiou]/g)
  const doubleLetter = word.match(/(.)\1/g)
  const forbidden = word.match(/ab|cd|pq|xy/g)
  return vowels && vowels.length >= 3 && doubleLetter && !forbidden
}

function isNicePart2(word: string) {
  const pair = word.match(/(..).*\1/g)
  const repeat = word.match(/(.).\1/g)
  return pair && repeat
}

function part1(inputString: string) {
  const words = parseInput(inputString)
  return words.filter(word => isNicePart1(word)).length
}

function part2(inputString: string) {
  const words = parseInput(inputString)
  return words.filter(word => isNicePart2(word)).length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ugknbfddgicrmopn",
        expected: 1,
      },
      {
        input: "jchzalrnumimnmhp",
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "qjhvhtzxzqqjkmpb",
        expected: 1,
      },
      {
        input: "ieodomkazucvgmuy",
        expected: 0,
      },
    ],
  },
} as AdventOfCodeContest
