import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 3

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function part1(inputString: string) {
  const numbers = parseInput(inputString).sort((a, b) => b - a)
  const bestSet = new Set<number>()
  for (const number of numbers) {
    if (!bestSet.has(number)) {
      bestSet.add(number)
    }
  }
  return [...bestSet].reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const numbers = parseInput(inputString).sort((a, b) => a - b)
  const bestSet = new Set<number>()
  for (const number of numbers) {
    if (!bestSet.has(number)) {
      bestSet.add(number)
      if (bestSet.size === 20) {
        break
      }
    }
  }
  return [...bestSet].reduce((a, b) => a + b, 0)
}

function part3(inputString: string) {
  const numbers = parseInput(inputString)
  const counts = new Map<number, number>()
  for (const number of numbers) {
    counts.set(number, (counts.get(number) || 0) + 1)
  }
  return utils.iterate.max([...counts.values()])
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `10,5,1,10,3,8,5,2,2`,
        expected: 29,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `4,51,13,64,57,51,82,57,16,88,89,48,32,49,49,2,84,65,49,43,9,13,2,3,75,72,63,48,61,14,40,77`,
        expected: 781,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `4,51,13,64,57,51,82,57,16,88,89,48,32,49,49,2,84,65,49,43,9,13,2,3,75,72,63,48,61,14,40,77`,
        expected: 3,
      },
    ],
  },
} as EverybodyCodesContest
