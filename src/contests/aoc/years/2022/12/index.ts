import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 12

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function getHeight(char: string): number {
  if (char === "S") {
    return "a".charCodeAt(0)
  }
  if (char === "E") {
    return "z".charCodeAt(0)
  }
  return char.charCodeAt(0)
}

function solve(grid: string[][], starts: Vector2[]): number {
  return utils.algo.simpleBfs(starts, {
    key: pos => pos.str(),
    adjacents: pos => {
      const currentHeight = getHeight(utils.grid.at(grid, pos))
      return pos.plusShapeNeighbors().filter(neighbor => {
        if (!utils.grid.inBounds(grid, neighbor)) return false
        const neighborHeight = getHeight(utils.grid.at(grid, neighbor))
        return neighborHeight <= currentHeight + 1
      })
    },
    ends: pos => utils.grid.at(grid, pos) === "E",
  })
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const startPosition = utils.grid.find(input, char => char === "S")
  if (!startPosition) {
    throw new Error("Start position not found")
  }
  return solve(input, [new Vector2(startPosition.x, startPosition.y)])
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const startPositions = utils.grid.findPositions(input, char => char === "S" || char === "a")
  return solve(
    input,
    startPositions.map(pos => new Vector2(pos.x, pos.y))
  )
}

const EXAMPLE = `
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 31,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 29,
      },
    ],
  },
} as AdventOfCodeContest
