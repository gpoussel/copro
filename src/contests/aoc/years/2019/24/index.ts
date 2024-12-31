import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 24

const BUG = "#"
const EMPTY = "."
const UNKNOWN = "?"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function nextCellState(cell: string, adjacentBugs: number) {
  if (cell === BUG) {
    return adjacentBugs === 1 ? BUG : EMPTY
  }
  return adjacentBugs === 1 || adjacentBugs === 2 ? BUG : EMPTY
}

function nextGrid(grid: string[][]) {
  return utils.grid.map(grid, (cell, x, y) => {
    const position = new Vector2(x, y)
    const neighborPositions = position.plusShapeNeighbors()
    const neighborCells = neighborPositions.map(pos => utils.grid.at(grid, pos))
    const adjacentBugs = neighborCells.filter(c => c === BUG).length
    return nextCellState(cell, adjacentBugs)
  })
}

function keyGrid(grid: string[][]) {
  return grid.flat().join("")
}

function getBiodiversityRating(grid: string[][]) {
  const bugPositions = utils.grid.findPositions(grid, cell => cell === BUG)
  return bugPositions.map(pos => 2 ** (pos.y * grid[0].length + pos.x)).reduce((a, b) => a + b, 0)
}

function nextGridRecursive(levels: string[][][]): string[][][] {
  let nextLevels = [...Array.from({ length: levels.length }, () => utils.grid.create(5, 5, EMPTY))]
  for (let level = 0; level < levels.length; level++) {
    for (let y = 0; y < levels[level].length; y++) {
      for (let x = 0; x < levels[level][y].length; x++) {
        const position = new Vector2(x, y)
        const neighbors: string[] = []
        if (x === 2 && y === 2) {
          utils.grid.set(nextLevels[level], position, UNKNOWN)
          continue
        }
        if (level > 0) {
          if (x === 0) {
            neighbors.push(utils.grid.at(levels[level - 1], new Vector2(1, 2)))
          } else if (x === 4) {
            neighbors.push(utils.grid.at(levels[level - 1], new Vector2(3, 2)))
          }
          if (y === 0) {
            neighbors.push(utils.grid.at(levels[level - 1], new Vector2(2, 1)))
          } else if (y === 4) {
            neighbors.push(utils.grid.at(levels[level - 1], new Vector2(2, 3)))
          }
        }
        if (level < levels.length - 1) {
          if (x === 1 && y === 2) {
            neighbors.push(...levels[level + 1].map(row => row[0]))
          } else if (x === 3 && y === 2) {
            neighbors.push(...levels[level + 1].map(row => row[4]))
          } else if (x === 2 && y === 1) {
            neighbors.push(...levels[level + 1][0])
          } else if (x === 2 && y === 3) {
            neighbors.push(...levels[level + 1][4])
          }
        }
        position.plusShapeNeighbors().forEach(pos => neighbors.push(utils.grid.at(levels[level], pos)))
        utils.grid.set(
          nextLevels[level],
          position,
          nextCellState(utils.grid.at(levels[level], position), neighbors.filter(c => c === BUG).length)
        )
      }
    }
  }
  return nextLevels
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const seen = new Set<string>()
  let currentGrid = grid
  while (!seen.has(keyGrid(currentGrid))) {
    seen.add(keyGrid(currentGrid))
    currentGrid = nextGrid(currentGrid)
  }
  return getBiodiversityRating(currentGrid)
}

function iterateGridRecursive(grid: string[][], times: number): string[][][] {
  const gridSize = grid.length
  let levels = [
    ...Array.from({ length: Math.ceil(times / 2) }, () => utils.grid.create(gridSize, gridSize, EMPTY)),
    grid,
    ...Array.from({ length: Math.ceil(times / 2) }, () => utils.grid.create(gridSize, gridSize, EMPTY)),
  ]
  for (let i = 0; i < times; i++) {
    levels = nextGridRecursive(levels)
  }
  return levels
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const gridLevels = iterateGridRecursive(input, 200)
  return gridLevels.map(grid => utils.grid.findPositions(grid, cell => cell === BUG).length).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
....#
#..#.
#..##
..#..
#....`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2129920,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
