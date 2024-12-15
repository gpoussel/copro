import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 1

function parseInput(input: string) {
  return utils.input.firstLine(input).split("")
}

function computeCostChar(char: string): number {
  if (char === "B") return 1
  if (char === "C") return 3
  if (char === "D") return 5
  return 0
}

function computeCostPair(first: string, second: string) {
  if (first === "x") {
    return computeCostChar(second)
  } else if (second === "x") {
    return computeCostChar(first)
  }
  return computeCostChar(first) + computeCostChar(second) + 2
}

function computeCostTriple(first: string, second: string, third: string) {
  if (first === "x") {
    return computeCostPair(second, third)
  } else if (second === "x") {
    return computeCostPair(first, third)
  } else if (third === "x") {
    return computeCostPair(first, second)
  }
  return computeCostChar(first) + computeCostChar(second) + computeCostChar(third) + 6
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(char => computeCostChar(char)).reduce((acc, val) => acc + val, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return Array.from({ length: input.length / 2 })
    .map((_, index) => computeCostPair(input[2 * index], input[2 * index + 1]))
    .reduce((acc, val) => acc + val, 0)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  return Array.from({ length: input.length / 3 })
    .map((_, index) => computeCostTriple(input[3 * index], input[3 * index + 1], input[3 * index + 2]))
    .reduce((acc, val) => acc + val, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ABBAC",
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "AxBCDDCAxD",
        expected: 28,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: "xBxAAABCDxCC",
        expected: 30,
      },
    ],
  },
} as EverybodyCodesContest
