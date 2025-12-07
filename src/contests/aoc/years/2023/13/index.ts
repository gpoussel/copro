import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 13

function parseInput(input: string) {
  return utils.input.blocks(input).map(block => utils.input.readGrid(block))
}

function countDifferences(a: string[], b: string[]): number {
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++
  }
  return diff
}

function findHorizontalMirror(grid: string[][], smudges: number): number {
  for (let row = 0; row < grid.length - 1; row++) {
    let totalDiff = 0
    for (let offset = 0; row - offset >= 0 && row + 1 + offset < grid.length; offset++) {
      totalDiff += countDifferences(grid[row - offset], grid[row + 1 + offset])
    }
    if (totalDiff === smudges) return row + 1
  }
  return 0
}

function findVerticalMirror(grid: string[][], smudges: number): number {
  const transposed = grid[0].map((_, colIdx) => grid.map(row => row[colIdx]))
  return findHorizontalMirror(transposed, smudges)
}

function solve(grids: string[][][], smudges: number): number {
  let sum = 0
  for (const grid of grids) {
    const h = findHorizontalMirror(grid, smudges)
    const v = findVerticalMirror(grid, smudges)
    sum += h * 100 + v
  }
  return sum
}

function part1(inputString: string) {
  const grids = parseInput(inputString)
  return solve(grids, 0)
}

function part2(inputString: string) {
  const grids = parseInput(inputString)
  return solve(grids, 1)
}

const EXAMPLE = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 405,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 400,
      },
    ],
  },
} as AdventOfCodeContest
