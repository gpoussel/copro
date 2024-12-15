import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 3

const PROMISING_AREA_CHAR = "#"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function solve(inputString: string, neighbors: (position: Vector2) => Vector2[]) {
  const input = parseInput(inputString)
  let done = false
  let level = 1
  let grid: number[][] = utils.grid.clone(input, cell => (cell === PROMISING_AREA_CHAR ? 1 : 0))
  while (!done) {
    done = true
    const nextLevelGrid = utils.grid.clone(grid)
    utils.grid.iterate(
      grid,
      (value, x, y) => {
        const canDig = neighbors(new Vector2(x, y)).every(neighbor => utils.grid.at(grid, neighbor) === level)
        if (canDig) {
          utils.grid.set(nextLevelGrid, { x, y }, level + 1)
          done = false
        }
      },
      cell => cell === level
    )
    grid = nextLevelGrid
    level++
  }
  return utils.grid.iterate(grid, cell => cell).reduce((acc, cell) => acc + cell, 0)
}

function part1(inputString: string) {
  return solve(inputString, position => position.plusShapeNeighbors())
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  return solve(inputString, position => position.neighbors())
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
..........
..###.##..
...####...
..######..
..######..
...####...
..........`,
        expected: 35,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
..........
..###.##..
...####...
..######..
..######..
...####...
..........`,
        expected: 29,
      },
    ],
  },
} as EverybodyCodesContest
