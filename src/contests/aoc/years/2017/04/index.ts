import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 4

function parseInput(input: string) {
  return utils.input.lines(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(line => {
    const words = line.split(" ")
    return new Set(words).size === words.length
  }).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.filter(line => {
    const wordsOfSortedLetters = line.split(" ").map(word => word.split("").sort().join(""))
    return new Set(wordsOfSortedLetters).size === wordsOfSortedLetters.length
  }).length
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
