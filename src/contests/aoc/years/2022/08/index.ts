import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 8

function parseInput(input: string) {
  return utils.grid.map(utils.input.readGrid(input), c => +c)
}

function scanVisibleTreesFromLineOutside(
  grid: number[][],
  start: Vector2,
  direction: Vector2,
  length: number,
  visibleTrees: Set<string>
) {
  let position = start
  visibleTrees.add(position.str())
  let maxHeight = utils.grid.at(grid, position)
  for (let i = 1; i < length && maxHeight < 9; i++) {
    position = position.add(direction)
    const h = utils.grid.at(grid, position)
    if (h > maxHeight) {
      visibleTrees.add(position.str())
      maxHeight = h
    }
  }
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const visibleTrees = new Set<string>()
  const height = grid.length
  const width = grid[0].length

  for (let y = 0; y < height; y++) {
    scanVisibleTreesFromLineOutside(grid, new Vector2(0, y), new Vector2(1, 0), width, visibleTrees)
    scanVisibleTreesFromLineOutside(grid, new Vector2(width - 1, y), new Vector2(-1, 0), width, visibleTrees)
  }
  for (let x = 0; x < width; x++) {
    scanVisibleTreesFromLineOutside(grid, new Vector2(x, 0), new Vector2(0, 1), height, visibleTrees)
    scanVisibleTreesFromLineOutside(grid, new Vector2(x, height - 1), new Vector2(0, -1), height, visibleTrees)
  }

  return visibleTrees.size
}

function scanVisibleTreesFromLineInside(grid: number[][], start: Vector2, direction: Vector2, treeHeight: number) {
  let position = start
  let count = 0
  while (utils.grid.inBounds(grid, position)) {
    count++
    const h = utils.grid.at(grid, position)
    if (h >= treeHeight) {
      // View is blocked by a tree of same height or taller
      break
    }
    position = position.add(direction)
  }
  return count
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const height = grid.length
  const width = grid[0].length

  let bestScore = -Infinity
  for (let startY = 1; startY < height - 1; startY++) {
    for (let startX = 1; startX < width - 1; startX++) {
      const start = new Vector2(startX, startY)
      const treeHeight = utils.grid.at(grid, start)
      const visibleTrees = [new Vector2(1, 0), new Vector2(-1, 0), new Vector2(0, 1), new Vector2(0, -1)].map(
        direction => scanVisibleTreesFromLineInside(grid, start.add(direction), direction, treeHeight)
      )
      const score = visibleTrees.reduce((acc, count) => acc * count, 1)
      if (score > bestScore) {
        bestScore = score
      }
    }
  }

  return bestScore
}

const EXAMPLE = `
30373
25512
65332
33549
35390`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 21,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 8,
      },
    ],
  },
} as AdventOfCodeContest
