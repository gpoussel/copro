import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 6

function parseInput(input: string) {
  return utils.input.firstLine(input).split(/\s+/).map(Number)
}

function solve(inputString: string, maxSeen: number) {
  const banks = parseInput(inputString)

  const visited = new Map<string, number>()
  visited.set(banks.join(), 1)

  while (true) {
    const max = Math.max(...banks)
    const maxIndex = banks.indexOf(max)
    banks[maxIndex] = 0
    for (let i = 1; i <= max; i++) {
      banks[(maxIndex + i) % banks.length]++
    }
    const visitedKey = banks.join()
    if (!visited.has(visitedKey)) {
      visited.set(visitedKey, 1)
    } else {
      visited.set(visitedKey, visited.get(visitedKey)! + 1)
    }
    if (visited.get(visitedKey)! === maxSeen) {
      return {
        count: visited.size,
        loopSize: [...visited.entries()].filter(([_, count]) => count === maxSeen - 1).length + 1,
      }
    }
  }
}

function part1(inputString: string) {
  return solve(inputString, 2).count
}

function part2(inputString: string) {
  return solve(inputString, 3).loopSize
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "0 2 7 0",
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "0 2 7 0",
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
