import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2023 - Day 11

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function solve(grid: string[][], expansionFactor: number): number {
  // Find all galaxies
  const galaxies: Vector2[] = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "#") {
        galaxies.push(new Vector2(x, y))
      }
    }
  }

  // Find empty rows and columns
  const emptyRows = new Set<number>()
  const emptyCols = new Set<number>()

  for (let y = 0; y < grid.length; y++) {
    if (grid[y].every(c => c === ".")) {
      emptyRows.add(y)
    }
  }

  for (let x = 0; x < grid[0].length; x++) {
    if (grid.every(row => row[x] === ".")) {
      emptyCols.add(x)
    }
  }

  // Calculate sum of distances between all pairs
  let sum = 0
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      const a = galaxies[i]
      const b = galaxies[j]

      // Count empty rows and columns between the two galaxies
      const minX = Math.min(a.x, b.x)
      const maxX = Math.max(a.x, b.x)
      const minY = Math.min(a.y, b.y)
      const maxY = Math.max(a.y, b.y)

      let emptyRowsCrossed = 0
      let emptyColsCrossed = 0

      for (let y = minY; y < maxY; y++) {
        if (emptyRows.has(y)) emptyRowsCrossed++
      }
      for (let x = minX; x < maxX; x++) {
        if (emptyCols.has(x)) emptyColsCrossed++
      }

      // Manhattan distance + expansion for empty rows/cols
      const baseDistance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
      const expansion = (emptyRowsCrossed + emptyColsCrossed) * (expansionFactor - 1)
      sum += baseDistance + expansion
    }
  }

  return sum
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 2)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 1000000)
}

const EXAMPLE = `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 374,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
