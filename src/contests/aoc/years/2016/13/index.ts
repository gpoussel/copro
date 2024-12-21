import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGrid } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 13

function parseInput(input: string) {
  return +utils.input.firstLine(input)
}

function buildGrid(input: number, width: number, height: number) {
  const grid: string[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => "."))
  const gridWithWalls = utils.grid.map(grid, (_, x, y) => {
    const n = x * x + 3 * x + 2 * x * y + y + y * y + input
    return utils.math.countSetBits(n) % 2 === 0 ? "." : "#"
  })
  return gridWithWalls
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const target = new Vector2(31, 39)
  const height = target.y + 5
  const width = target.x + 5
  const grid = buildGrid(input, width, height)

  const { bestScore } = dijkstraOnGrid(grid, {
    starts: [new Vector2(1, 1)],
    isMoveValid(from, to) {
      return to !== "#"
    },
    ends: (position, _) => position.equals(target),
    moveCost: 1,
  })
  return bestScore
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const height = 51
  const width = 51
  const grid = buildGrid(input, width, height)

  const { visitedNodes } = dijkstraOnGrid(grid, {
    starts: [new Vector2(1, 1)],
    isMoveValid(from, to) {
      return to !== "#"
    },
    ends: (_, path) => path.length > 50,
    moveCost: 1,
  })
  return visitedNodes
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
