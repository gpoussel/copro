import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Heading } from "../../../../../utils/grid.js"

// 🎄 Advent of Code 2025 - Day 4

function parseInput(input: string) {
  return utils.input.readGrid(input).map(row => row.map(cell => (cell === "@" ? 1 : 0)))
}

function isAccessible(grid: number[][], position: Vector2): boolean {
  const cellValue = utils.grid.at(grid, position)
  const neighborDirections: Heading[] = [
    "up-left",
    "up",
    "up-right",
    "right",
    "down-right",
    "down",
    "down-left",
    "left",
  ]
  const neighborPositions = neighborDirections.map(direction => position.move(direction))
  const sumOfNeighbors = neighborPositions.reduce((sum, neighborPos) => {
    const neighborValue = utils.grid.at(grid, neighborPos)
    return sum + (neighborValue ?? 0)
  }, 0)
  return cellValue === 1 && sumOfNeighbors < 4
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  let count = 0
  utils.grid.iterate(grid, (_, row, col) => {
    if (isAccessible(grid, new Vector2(row, col))) {
      count++
    }
  })
  return count
}

function part2(inputString: string) {
  let grid = parseInput(inputString)

  let changed = true
  let removed = 0
  while (changed) {
    changed = false
    grid = utils.grid.map(grid, (value, row, col) => {
      const position = new Vector2(row, col)
      if (isAccessible(grid, position)) {
        changed = true
        removed++
        return 0
      }
      return value
    })
  }
  return removed
}

const EXAMPLE = `
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 13,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 43,
      },
    ],
  },
} as AdventOfCodeContest
