import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, Vector2Set } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 16

const START_CELL = "S"
const END_CELL = "E"
const WALL_CELL = "#"
const MOVE_COST = 1
const TURN_COST = 1000

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const start = Vector2.fromCoordinates(utils.grid.find(grid, cell => cell === START_CELL)!)
  const end = Vector2.fromCoordinates(utils.grid.find(grid, cell => cell === END_CELL)!)
  return { grid, start, end }
}

function part1(inputString: string) {
  const { grid, start, end } = parseInput(inputString)
  return utils.algo.dijkstraWithDirectionsOnGrid(grid, end, {
    starts: [{ position: start, dir: "right" }],
    stopOnFirst: true,
    isMoveValid: (_from, to) => to !== WALL_CELL,
    moveCost: MOVE_COST,
    turnCost: TURN_COST,
  }).bestScore
}

function part2(inputString: string) {
  const { grid, start, end } = parseInput(inputString)
  const { bestPaths } = utils.algo.dijkstraWithDirectionsOnGrid(grid, end, {
    starts: [{ position: start, dir: "right" }],
    stopOnFirst: false,
    isMoveValid: (_from, to) => to !== WALL_CELL,
    moveCost: MOVE_COST,
    turnCost: TURN_COST,
  })
  const uniqueVisitedPositions = new Vector2Set()
  bestPaths.forEach(({ positions }) => positions.forEach(position => uniqueVisitedPositions.add(position)))
  return uniqueVisitedPositions.length
}

const EXAMPLE = `
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############`

const EXAMPLE2 = `
#################
#...#...#...#..E#
#.#.#.#.#.#.#.#.#
#.#.#.#...#...#.#
#.#.#.#.###.#.#.#
#...#.#.#.....#.#
#.#.#.#.#.#####.#
#.#...#.#.#.....#
#.#.#####.#.###.#
#.#.#.......#...#
#.#.###.#####.###
#.#.#...#.....#.#
#.#.#.#####.###.#
#.#.#.........#.#
#.#.#.#########.#
#S#.............#
#################`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 7036,
      },
      {
        input: EXAMPLE2,
        expected: 11048,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 45,
      },
      {
        input: EXAMPLE2,
        expected: 64,
      },
    ],
  },
} as AdventOfCodeContest
