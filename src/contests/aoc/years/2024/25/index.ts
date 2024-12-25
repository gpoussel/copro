import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 25

function parseInput(input: string) {
  const grids = utils.input.blocks(input).map(block => utils.input.readGrid(block))
  const locks = grids
    .filter(g => g[0].every(c => c === "#"))
    .map(grid => utils.grid.columns(grid).map(c => c.indexOf(".") - 1))
  const keys = grids
    .filter(g => g[g.length - 1].every(c => c === "#"))
    .map(grid => utils.grid.columns(grid).map(c => c.length - c.indexOf("#") - 1))
  return { locks, keys }
}

function part1(inputString: string) {
  const { locks, keys } = parseInput(inputString)
  return locks
    .flatMap(lock => keys.map(key => (lock.every((l, i) => l + key[i] <= 5) ? 1 : 0)))
    .reduce((a: number, b: number) => a + b, 0)
}

function part2() {
  return "Merry Christmas!"
}

const EXAMPLE = `
#####
.####
.####
.####
.#.#.
.#...
.....

#####
##.##
.#.##
...##
...#.
...#.
.....

.....
#....
#....
#...#
#.#.#
#.###
#####

.....
.....
#.#..
###..
###.#
###.#
#####

.....
.....
.....
#....
#.#..
#.#.#
#####`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
