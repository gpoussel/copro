import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2021 - Day 11

function parseInput(input: string) {
  return utils.grid.map(utils.input.readGrid(input), v => +v)
}

function performFlashStep(grid: number[][]) {
  const flashed = new Set<string>()
  let anyFlash = true
  while (anyFlash) {
    anyFlash = false
    utils.grid.iterate(grid, (v, x, y) => {
      const pos = new Vector2(x, y)
      if (v > 9 && !flashed.has(pos.str())) {
        flashed.add(pos.str())
        anyFlash = true
        // Increase all neighbors by 1
        pos.neighbors().forEach(n => {
          if (utils.grid.inBounds(grid, n)) {
            const neighborValue = utils.grid.at(grid, n)!
            utils.grid.set(grid, n, neighborValue + 1)
          }
        })
      }
    })
  }
  return flashed
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  let totalFlashes = 0
  for (let step = 0; step < 100; step++) {
    utils.grid.iterate(grid, (v, x, y) => {
      utils.grid.set(grid, { x, y }, v + 1)
    })
    const flashed = performFlashStep(grid)
    flashed.forEach(key => utils.grid.set(grid, Vector2.fromKey(key), 0))
    totalFlashes += flashed.size
  }
  return totalFlashes
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  let iteration = 1
  while (true) {
    utils.grid.iterate(grid, (v, x, y) => {
      utils.grid.set(grid, { x, y }, v + 1)
    })
    const flashed = performFlashStep(grid)
    if (flashed.size === grid.length * grid[0].length) {
      return iteration
    }
    flashed.forEach(key => utils.grid.set(grid, Vector2.fromKey(key), 0))
    iteration++
  }
}

const EXAMPLE = `
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1656,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 195,
      },
    ],
  },
} as AdventOfCodeContest
