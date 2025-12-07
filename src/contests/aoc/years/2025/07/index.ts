import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2025 - Day 7

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const startX = grid[0].indexOf("S")
  let positions = [startX]
  let splitCount = 0
  for (let row = 1; row < grid.length; row++) {
    const newPositions: Set<number> = new Set()
    for (const pos of positions) {
      if (utils.grid.at(grid, new Vector2(pos, row)) === ".") {
        newPositions.add(pos)
      } else if (utils.grid.at(grid, new Vector2(pos, row)) === "^") {
        newPositions.add(pos - 1)
        newPositions.add(pos + 1)
        splitCount++
      }
    }
    positions = Array.from(newPositions)
  }
  return splitCount
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const howManyWays = utils.grid.create<number>(grid[0].length, grid.length, 0)
  const startX = grid[0].indexOf("S")
  utils.grid.set(howManyWays, new Vector2(startX, 0), 1)
  for (let row = 1; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const pos = new Vector2(col, row)
      const cell = utils.grid.at(grid, pos)
      if (cell === ".") {
        const ways = utils.grid.at(howManyWays, pos.move("up"))
        utils.grid.set(howManyWays, pos, utils.grid.at(howManyWays, pos) + ways)
      } else if (cell === "^") {
        const ways = utils.grid.at(howManyWays, pos.move("up"))
        const left = pos.move("left")
        utils.grid.set(howManyWays, left, utils.grid.at(howManyWays, left) + ways)
        const right = pos.move("right")
        utils.grid.set(howManyWays, right, utils.grid.at(howManyWays, right) + ways)
      }
    }
  }
  return howManyWays[howManyWays.length - 1].reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`

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
        expected: 40,
      },
    ],
  },
} as AdventOfCodeContest
