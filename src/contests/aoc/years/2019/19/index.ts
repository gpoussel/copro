import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 19

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function buildGridFromProgram(program: number[], size: number, topLeft = new Vector2(0, 0)) {
  const grid = utils.grid.create(size, size, ".")
  for (let y = 0; y < grid.length; ++y) {
    for (let x = 0; x < grid[y].length; ++x) {
      const position = new Vector2(x, y)
      const computer = new Computer(program, [x + topLeft.x, y + topLeft.y])
      computer.run()
      const result = computer.outputs.shift()
      utils.grid.set(grid, position, result === 1 ? "#" : ".")
    }
  }
  return grid
}

function findTractorValue(program: number[], row: number, searchStartIndex: number, value: number) {
  let index = searchStartIndex
  while (true) {
    const computer = new Computer(program, [index, row])
    computer.run()
    if (computer.outputs.shift() === value) {
      return index
    }
    index++
  }
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const grid = buildGridFromProgram(program, 100)
  return utils.grid.findPositions(grid, c => c === "#").length
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  let row = 10
  let startColumn = 0
  let endColumn = findTractorValue(program, row, startColumn, 1) + 1
  const rows = new Map<number, { start: number; end: number }>()

  function isSquareFound() {
    const squareStartRow = rows.get(row - 99)
    if (!squareStartRow) {
      return false
    }
    const { start, end } = squareStartRow
    return startColumn >= start && startColumn + 100 < end
  }

  while (!isSquareFound()) {
    startColumn = findTractorValue(program, row, startColumn, 1)
    endColumn = findTractorValue(program, row, endColumn, 0)
    rows.set(row, { start: startColumn, end: endColumn })
    ++row
  }

  const topLeft = new Vector2(startColumn, row - 100)
  return topLeft.x * 10000 + topLeft.y
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
