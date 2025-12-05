import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2021 - Day 15

function parseInput(input: string) {
  return utils.grid.map(utils.input.readGrid(input), c => +c)
}

function getRiskLevel(grid: number[][]) {
  const { bestScore } = utils.algo.dijkstraOnGraph<Vector2>(
    [new Vector2(0, 0)],
    [new Vector2(grid[0].length - 1, grid.length - 1)],
    {
      equals(a, b) {
        return a.equals(b)
      },
      key(node) {
        return node.str()
      },
      moves(node) {
        const moves: { to: Vector2; cost: number }[] = []
        for (const neighbor of node.plusShapeNeighbors()) {
          if (neighbor.x >= 0 && neighbor.x < grid[0].length && neighbor.y >= 0 && neighbor.y < grid.length) {
            moves.push({ to: neighbor, cost: grid[neighbor.y][neighbor.x] })
          }
        }
        return moves
      },
    }
  )
  return bestScore
}

function enlarge(grid: number[][], times: number) {
  const originalHeight = grid.length
  const originalWidth = grid[0].length
  const newGrid: number[][] = utils.grid.create(originalHeight * times, originalWidth * times, 0)
  for (let tileY = 0; tileY < times; tileY++) {
    for (let tileX = 0; tileX < times; tileX++) {
      for (let y = 0; y < originalHeight; y++) {
        for (let x = 0; x < originalWidth; x++) {
          let newValue = grid[y][x] + tileX + tileY
          while (newValue > 9) {
            newValue -= 9
          }
          newGrid[tileY * originalHeight + y][tileX * originalWidth + x] = newValue
        }
      }
    }
  }
  return newGrid
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return getRiskLevel(grid)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const largeGrid = enlarge(grid, 5)
  return getRiskLevel(largeGrid)
}

const EXAMPLE = `
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 40,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 315,
      },
    ],
  },
} as AdventOfCodeContest
