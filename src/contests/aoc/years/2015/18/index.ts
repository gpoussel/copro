import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2015 - Day 18

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

const TURNS = 100

function computeNewState(position: Vector2, grid: string[][]) {
  const onNeighbors = position.neighbors().filter(n => utils.grid.at(grid, n) === "#").length
  if (utils.grid.at(grid, position) === "#") {
    return onNeighbors === 2 || onNeighbors === 3 ? "#" : "."
  } else {
    return onNeighbors === 3 ? "#" : "."
  }
}

function part1(inputString: string) {
  let grid = parseInput(inputString)
  let turns = TURNS
  while (turns--) {
    grid = utils.grid.map(grid, (cell, x, y) => {
      return computeNewState(new Vector2(x, y), grid)
    })
  }
  return utils.grid.findPositions(grid, cell => cell === "#").length
}

function part2(inputString: string) {
  let grid = parseInput(inputString)
  let turns = TURNS
  while (turns--) {
    grid = utils.grid.map(grid, (cell, x, y) => {
      if (x === 0 && y === 0) return "#"
      if (x === 0 && y === grid.length - 1) return "#"
      if (x === grid[0].length - 1 && y === 0) return "#"
      if (x === grid[0].length - 1 && y === grid.length - 1) return "#"
      return computeNewState(new Vector2(x, y), grid)
    })
  }
  return utils.grid.findPositions(grid, cell => cell === "#").length
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
