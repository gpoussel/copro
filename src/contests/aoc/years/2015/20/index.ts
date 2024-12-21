import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 20

function parseInput(input: string) {
  return +utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const count = input / 10
  const housePresentCounts = Array.from({ length: count + 1 }, () => 0)
  for (let elfNumber = 1; elfNumber <= count; ++elfNumber) {
    for (let houseNumber = elfNumber; houseNumber <= count; houseNumber += elfNumber) {
      housePresentCounts[houseNumber] += elfNumber
    }
  }
  return housePresentCounts.findIndex(presents => presents >= count)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const count = input / 11
  const housePresentCounts = Array.from({ length: count }, () => 0)
  for (let elfNumber = 1; elfNumber <= count; ++elfNumber) {
    let maxHouses = 50
    for (let houseNumber = elfNumber; houseNumber <= count && maxHouses-- > 0; houseNumber += elfNumber) {
      housePresentCounts[houseNumber] += elfNumber
    }
  }
  return housePresentCounts.findIndex(presents => presents >= count)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "70",
        expected: 4,
      },
      {
        input: "130",
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
