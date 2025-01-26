import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Heading, HEADING_DIRECTIONS } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2020 - Day 11

const FLOOR_CELL = "."
const OCCUPIED_SEAT_CELL = "#"
const EMPTY_SEAT_CELL = "L"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function tickPart1(grid: string[][]) {
  return utils.grid.map(grid, (cell, x, y) => {
    if (cell === FLOOR_CELL) {
      return FLOOR_CELL
    }
    const position = new Vector2(x, y)
    const neighborValues = position.neighbors().map(neighbor => utils.grid.at(grid, neighbor))
    const occupiedNeighbors = neighborValues.filter(value => value === OCCUPIED_SEAT_CELL).length
    if (cell === EMPTY_SEAT_CELL && occupiedNeighbors === 0) {
      return OCCUPIED_SEAT_CELL
    }
    if (cell === OCCUPIED_SEAT_CELL && occupiedNeighbors >= 4) {
      return EMPTY_SEAT_CELL
    }
    return cell
  })
}

function explore(start: Vector2, heading: Heading, grid: string[][]) {
  let position = start
  while (true) {
    position = position.move(heading)
    if (utils.grid.inBounds(grid, position)) {
      const cell = utils.grid.at(grid, position)
      if (cell !== FLOOR_CELL) {
        return cell
      }
    } else {
      return undefined
    }
  }
}

function tickPart2(grid: string[][]) {
  return utils.grid.map(grid, (cell, x, y) => {
    if (cell === FLOOR_CELL) {
      return FLOOR_CELL
    }
    const position = new Vector2(x, y)
    const neighborValues = HEADING_DIRECTIONS.map(heading => explore(position, heading, grid))
    const occupiedNeighbors = neighborValues.filter(value => value === OCCUPIED_SEAT_CELL).length
    if (cell === EMPTY_SEAT_CELL && occupiedNeighbors === 0) {
      return OCCUPIED_SEAT_CELL
    }
    if (cell === OCCUPIED_SEAT_CELL && occupiedNeighbors >= 5) {
      return EMPTY_SEAT_CELL
    }
    return cell
  })
}

function part1(inputString: string) {
  let grid = parseInput(inputString)
  let changed = true
  while (changed) {
    const newGrid = tickPart1(grid)
    changed = !utils.grid.equals(grid, newGrid)
    grid = newGrid
  }
  return utils.grid.countBy(grid, cell => cell === "#")
}

function part2(inputString: string) {
  let grid = parseInput(inputString)
  let changed = true
  while (changed) {
    const newGrid = tickPart2(grid)
    changed = !utils.grid.equals(grid, newGrid)
    grid = newGrid
  }
  return utils.grid.countBy(grid, cell => cell === "#")
}

const EXAMPLE = `
L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 37,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 26,
      },
    ],
  },
} as AdventOfCodeContest
