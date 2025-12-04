import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 5

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [from, to] = line.split(" -> ")
    const [x1, y1] = from.split(",").map(Number)
    const [x2, y2] = to.split(",").map(Number)
    return { x1, y1, x2, y2 }
  })
}

function drawGrid(lines: ReturnType<typeof parseInput>) {
  const grid: Record<string, number> = {}
  function drawAt(x: number, y: number) {
    const key = `${x},${y}`
    grid[key] = (grid[key] || 0) + 1
  }
  for (const line of lines) {
    const xStep = Math.sign(line.x1 - line.x2)
    const yStep = Math.sign(line.y1 - line.y2)
    let x = line.x1
    let y = line.y1
    while (x !== line.x2 || y !== line.y2) {
      drawAt(x, y)
      x -= xStep
      y -= yStep
    }
    drawAt(x, y)
  }
  return grid
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  const straightLines = lines.filter(line => line.x1 === line.x2 || line.y1 === line.y2)
  const grid = drawGrid(straightLines)
  return Object.values(grid).filter(count => count >= 2).length
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  const grid = drawGrid(lines)
  return Object.values(grid).filter(count => count >= 2).length
}

const EXAMPLE = `
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 12,
      },
    ],
  },
} as AdventOfCodeContest
