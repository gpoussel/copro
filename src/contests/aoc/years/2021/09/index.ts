import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2021 - Day 9

function parseInput(input: string) {
  return utils.grid.map(utils.input.readGrid(input), v => +v)
}

function findLowPoints(grid: number[][]) {
  const lowPoints: Vector2[] = []
  utils.grid.iterate(grid, (item, x, y) => {
    const pos = new Vector2(x, y)
    const neighbors = pos
      .plusShapeNeighbors()
      .map(np => utils.grid.at(grid, np))
      .filter(n => n !== undefined)
    if (neighbors.every(n => n! > item)) {
      lowPoints.push(pos)
    }
  })
  return lowPoints
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return findLowPoints(grid).reduce((sum, pos) => {
    return sum + utils.grid.at(grid, pos)! + 1
  }, 0)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const lowPoints = findLowPoints(grid)
  const basinSizes: number[] = []
  for (const lowPoint of lowPoints) {
    const { filledCount } = utils.grid.floodFill(grid, lowPoint, Infinity, {
      validNeighbor: (currentValue, neighborValue) => currentValue < neighborValue && neighborValue < 9,
    })
    basinSizes.push(filledCount)
  }
  return basinSizes
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((a, b) => a * b, 1)
}

const EXAMPLE = `
2199943210
3987894921
9856789892
8767896789
9899965678`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 15,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1134,
      },
    ],
  },
} as AdventOfCodeContest
