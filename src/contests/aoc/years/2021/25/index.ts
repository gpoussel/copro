import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 25

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function step(grid: string[][]): { newGrid: string[][]; moved: boolean } {
  const numRows = grid.length
  const numCols = grid[0].length
  let moved = false

  // First, move east-facing cucumbers ('>')
  const newGridEast = grid.map(row => [...row])
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (grid[r][c] === ">") {
        const nextC = (c + 1) % numCols
        if (grid[r][nextC] === ".") {
          newGridEast[r][c] = "."
          newGridEast[r][nextC] = ">"
          moved = true
        }
      }
    }
  }

  // Then, move south-facing cucumbers ('v')
  const newGridSouth = newGridEast.map(row => [...row])
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (newGridEast[r][c] === "v") {
        const nextR = (r + 1) % numRows
        if (newGridEast[nextR][c] === ".") {
          newGridSouth[r][c] = "."
          newGridSouth[nextR][c] = "v"
          moved = true
        }
      }
    }
  }

  return { newGrid: newGridSouth, moved }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let grid = input
  let steps = 0
  while (true) {
    steps++
    const result = step(grid)
    grid = result.newGrid
    if (!result.moved) {
      break
    }
  }
  return steps
}

function part2(inputString: string) {
  return "Merry Christmas!"
}

const EXAMPLE = `
v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 58,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
