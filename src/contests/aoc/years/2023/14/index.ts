import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 14

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function tiltNorth(grid: string[][]): void {
  for (let col = 0; col < grid[0].length; col++) {
    let writePos = 0
    for (let row = 0; row < grid.length; row++) {
      if (grid[row][col] === "#") {
        writePos = row + 1
      } else if (grid[row][col] === "O") {
        grid[row][col] = "."
        grid[writePos][col] = "O"
        writePos++
      }
    }
  }
}

function tiltSouth(grid: string[][]): void {
  for (let col = 0; col < grid[0].length; col++) {
    let writePos = grid.length - 1
    for (let row = grid.length - 1; row >= 0; row--) {
      if (grid[row][col] === "#") {
        writePos = row - 1
      } else if (grid[row][col] === "O") {
        grid[row][col] = "."
        grid[writePos][col] = "O"
        writePos--
      }
    }
  }
}

function tiltWest(grid: string[][]): void {
  for (let row = 0; row < grid.length; row++) {
    let writePos = 0
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col] === "#") {
        writePos = col + 1
      } else if (grid[row][col] === "O") {
        grid[row][col] = "."
        grid[row][writePos] = "O"
        writePos++
      }
    }
  }
}

function tiltEast(grid: string[][]): void {
  for (let row = 0; row < grid.length; row++) {
    let writePos = grid[0].length - 1
    for (let col = grid[0].length - 1; col >= 0; col--) {
      if (grid[row][col] === "#") {
        writePos = col - 1
      } else if (grid[row][col] === "O") {
        grid[row][col] = "."
        grid[row][writePos] = "O"
        writePos--
      }
    }
  }
}

function cycle(grid: string[][]): void {
  tiltNorth(grid)
  tiltWest(grid)
  tiltSouth(grid)
  tiltEast(grid)
}

function calculateLoad(grid: string[][]): number {
  let load = 0
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col] === "O") {
        load += grid.length - row
      }
    }
  }
  return load
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  tiltNorth(grid)
  return calculateLoad(grid)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const seen = new Map<string, number>()
  const target = 1000000000

  for (let i = 0; i < target; i++) {
    const key = utils.grid.build(grid)
    if (seen.has(key)) {
      const cycleStart = seen.get(key)!
      const cycleLength = i - cycleStart
      const remaining = (target - i) % cycleLength
      for (let j = 0; j < remaining; j++) {
        cycle(grid)
      }
      return calculateLoad(grid)
    }
    seen.set(key, i)
    cycle(grid)
  }

  return calculateLoad(grid)
}

const EXAMPLE = `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 136,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 64,
      },
    ],
  },
} as AdventOfCodeContest
