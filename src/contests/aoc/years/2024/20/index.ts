import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGrid } from "../../../../../utils/algo.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 20

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const needToGain = grid.length <= 15 ? 50 : 100
  return { grid, needToGain }
}

function findCheatEnds(start: Vector2, maxLength: number) {
  const ends = []
  for (let dx = -maxLength; dx <= maxLength; ++dx) {
    for (let dy = -(maxLength - Math.abs(dx)); dy <= maxLength - Math.abs(dx); ++dy) {
      const distance = Math.abs(dx) + Math.abs(dy)
      if (distance < 2) {
        continue
      }
      ends.push({
        pos: start.add(new Vector2(dx, dy)),
        distance: Math.abs(dx) + Math.abs(dy),
      })
    }
  }
  return ends
}

function findEfficientCheats(grid: string[][], minGain: number, maxCheatLength: number) {
  const startPosition = Vector2.fromCoordinates(utils.grid.find(grid, c => c === "S")!)
  const endPosition = Vector2.fromCoordinates(utils.grid.find(grid, c => c === "E")!)

  const { bestScore, bestPaths } = dijkstraOnGrid(grid, {
    starts: [startPosition],
    ends: [endPosition],
    isMoveValid: (from, to) => [".", "E"].includes(to),
    moveCost: 1,
  })

  if (bestPaths.length > 1) {
    throw new Error("Multiple paths found")
  }
  if (bestPaths.length === 0) {
    throw new Error("No path found")
  }
  const bestPath = bestPaths[0].positions
  const visited = new Map<string, number>()
  for (let i = 0; i < bestPath.length; ++i) {
    visited.set(bestPath[i].str(), i)
  }

  let count = 0
  for (const position of bestPath) {
    for (const { pos: end, distance } of findCheatEnds(position, maxCheatLength)) {
      if (visited.has(end.str())) {
        const gain = visited.get(end.str())! - visited.get(position.str())! - distance
        if (gain >= minGain) {
          ++count
        }
      }
    }
  }
  return count
}

function part1(inputString: string) {
  const { grid, needToGain } = parseInput(inputString)
  return findEfficientCheats(grid, needToGain, 2)
}

function part2(inputString: string) {
  const { grid, needToGain } = parseInput(inputString)
  return findEfficientCheats(grid, needToGain, 20)
}

const EXAMPLE = `
###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 285,
      },
    ],
  },
} as AdventOfCodeContest
