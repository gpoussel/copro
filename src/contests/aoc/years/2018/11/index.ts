import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 11

function parseInput(input: string) {
  return +utils.input.firstLine(input)
}

function createPowerGrid(serialNumber: number) {
  const grid = utils.grid.create(300, 300, 0)
  for (let i = 0; i < 300; ++i) {
    for (let j = 0; j < 300; ++j) {
      const rackId = i + 10
      let powerLevel = (Math.floor(((rackId * j + serialNumber) * rackId) / 100) % 10) - 5
      grid[j][i] = powerLevel
    }
  }
  return grid
}

function getBestSquare(grid: number[][], targetSize?: number) {
  // Implementation of the summed-area table algorithm
  const sumGrid = utils.grid.create(300, 300, 0)
  for (let y = 0; y < 300; ++y) {
    for (let x = 0; x < 300; ++x) {
      const cellValue = grid[y][x]
      sumGrid[y][x] =
        cellValue +
        (y >= 1 ? sumGrid[y - 1][x] : 0) +
        (x >= 1 ? sumGrid[y][x - 1] : 0) -
        (x >= 1 && y >= 1 ? sumGrid[y - 1][x - 1] : 0)
    }
  }
  const sizes = targetSize ? [targetSize] : Array.from({ length: 300 }, (_, i) => i + 1)
  let maxSum = -Infinity
  let bestPosition = new Vector2(-1, -1)
  let size = undefined
  for (const s of sizes) {
    for (let x = s; x < 300; ++x) {
      for (let y = s; y < 300; ++y) {
        const total = sumGrid[y][x] - sumGrid[y - s][x] - sumGrid[y][x - s] + sumGrid[y - s][x - s]
        if (total > maxSum) {
          maxSum = total
          bestPosition = new Vector2(x - s + 1, y - s + 1)
          size = s
        }
      }
    }
  }
  return { bestPosition: bestPosition!, maxSum, size }
}

function part1(inputString: string) {
  const serialNumber = parseInput(inputString)
  const grid = createPowerGrid(serialNumber)
  return getBestSquare(grid, 3).bestPosition?.str()
}

function part2(inputString: string) {
  const serialNumber = parseInput(inputString)
  const grid = createPowerGrid(serialNumber)
  const { bestPosition, size } = getBestSquare(grid)
  return bestPosition?.str() + "," + size
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "18",
        expected: "33,45",
      },
      {
        input: "42",
        expected: "21,61",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "18",
        expected: "90,269,16",
      },
    ],
  },
} as AdventOfCodeContest
