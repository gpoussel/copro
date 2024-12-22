import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGrid } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"
import { hashKnots } from "../10/index.js"

// 🎄 Advent of Code 2017 - Day 14

const GRID_SIZE = 128

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function buildGrid(inputString: string): string[][] {
  const input = parseInput(inputString)
  return Array.from({ length: GRID_SIZE }, (_, i) => {
    const hash = hashKnots(`${input}-${i}`)
    return hash
      .split("")
      .map(hex => parseInt(hex, 16).toString(2).padStart(4, "0"))
      .join("")
      .split("")
  })
}

function part1(inputString: string) {
  return utils.grid.findPositions(buildGrid(inputString), c => c === "1").length
}

function part2(inputString: string) {
  const grid = buildGrid(inputString)
  const walls = new VectorSet<Vector2>(utils.grid.findPositions(grid, c => c === "1").map(Vector2.fromCoordinates))
  let regions = 0
  while (walls.length > 0) {
    const firstWall = walls.vectors[0]
    regions++
    const visited = new VectorSet<Vector2>()
    const result = dijkstraOnGrid(grid, {
      starts: [firstWall],
      ends(position, path) {
        visited.add(position)
        return false
      },
      isMoveValid(from, to) {
        return to === "1"
      },
      moveCost: 1,
    })
    for (const position of visited.vectors) {
      utils.grid.set(grid, position, "0")
      walls.remove(position)
    }
  }

  return regions
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "flqrgnkx",
        expected: 8108,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "flqrgnkx",
        expected: 1242,
      },
    ],
  },
} as AdventOfCodeContest
