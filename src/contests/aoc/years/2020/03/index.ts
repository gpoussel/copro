import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2020 - Day 3

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function numberOfTreesWithSlope(grid: string[][], slope: Vector2) {
  let position = new Vector2(0, 0)
  let numberOfTrees = 0
  while (position.y < grid.length) {
    if (grid[position.y][position.x % grid[0].length] === "#") {
      ++numberOfTrees
    }
    position = position.add(slope)
  }
  return numberOfTrees
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return numberOfTreesWithSlope(grid, new Vector2(3, 1))
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const slopes = [new Vector2(1, 1), new Vector2(3, 1), new Vector2(5, 1), new Vector2(7, 1), new Vector2(1, 2)]
  return slopes.reduce((acc, slope) => {
    const trees = numberOfTreesWithSlope(input, slope)
    return acc * trees
  }, 1)
}

const EXAMPLE = `
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
