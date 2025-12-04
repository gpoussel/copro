import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 7

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function median(numbers: number[]) {
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  } else {
    return sorted[mid]
  }
}

function part1(inputString: string) {
  const positions = parseInput(inputString)
  const target = median(positions)
  return positions.reduce((acc, pos) => acc + Math.abs(pos - target), 0)
}

function part2(inputString: string) {
  const positions = parseInput(inputString)
  const min = utils.iterate.min(positions)
  const max = utils.iterate.max(positions)

  let bestFuel = Infinity
  for (let target = min; target <= max; target++) {
    const fuel = positions.reduce((acc, pos) => {
      const distance = Math.abs(pos - target)
      return acc + (distance * (distance + 1)) / 2
    }, 0)
    if (fuel < bestFuel) {
      bestFuel = fuel
    }
  }
  return bestFuel
}

const EXAMPLE = `16,1,2,0,4,2,7,1,2,14`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 37,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 168,
      },
    ],
  },
} as AdventOfCodeContest
