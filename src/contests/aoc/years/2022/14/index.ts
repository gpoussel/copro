import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 14

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const points = line.split(" -> ").map(part => {
      const [x, y] = part.split(",").map(Number)
      return new Vector2(x, y)
    })
    return points
  })
}

function normalizeLines(lines: Vector2[][]) {
  const allPoints = lines.flat()
  const xs = [...allPoints.map(p => p.x), 500]
  const ys = [...allPoints.map(p => p.y), 0]
  const { min: minY, max: maxY } = utils.iterate.minMax(ys)
  const { min: minX, max: maxX } = utils.iterate.minMax(xs)
  const originX = minX - (maxY - minY) - 2
  const origin = new Vector2(originX, minY)
  const width = maxX - originX + (maxY - minY) + 2
  const height = maxY - minY + 1
  return {
    normalizedLines: lines.map(line => line.map(point => point.subtract(origin))),
    origin: new Vector2(500, 0).subtract(origin),
    width,
    height,
  }
}

function buildGrid(lines: Vector2[][], width: number, height: number) {
  const grid = utils.grid.create<string>(width, height, ".")
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const from = line[i]
      const to = line[i + 1]
      const direction = from.directionTo(to)
      let position = from
      while (!position.equals(to)) {
        utils.grid.set(grid, position, "#")
        position = position.move(direction)
      }
      utils.grid.set(grid, to, "#")
    }
  }
  return grid
}

function solve(grid: string[][], origin: Vector2): number {
  let sandResting = 0
  while (true) {
    let sandPosition = origin
    while (true) {
      const below = sandPosition.move("down")
      if (!utils.grid.inBounds(grid, below)) {
        // Falls into the abyss
        return sandResting
      }
      if (utils.grid.at(grid, below) === ".") {
        sandPosition = below
        continue
      }
      const belowLeft = sandPosition.move("down").move("left")
      if (utils.grid.inBounds(grid, belowLeft) && utils.grid.at(grid, belowLeft) === ".") {
        sandPosition = belowLeft
        continue
      }
      const belowRight = sandPosition.move("down").move("right")
      if (utils.grid.inBounds(grid, belowRight) && utils.grid.at(grid, belowRight) === ".") {
        sandPosition = belowRight
        continue
      }
      utils.grid.set(grid, sandPosition, "o")
      sandResting++
      break
    }
    if (sandPosition.equals(origin)) {
      return sandResting
    }
  }
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  const { normalizedLines, origin, width, height } = normalizeLines(lines)
  const grid = buildGrid(normalizedLines, width, height)
  return solve(grid, origin)
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  const { normalizedLines, origin, width, height } = normalizeLines(lines)
  const grid = buildGrid(normalizedLines, width, height)
  grid.push(new Array(grid[0].length).fill("."))
  grid.push(new Array(grid[0].length).fill("#"))
  return solve(grid, origin)
}

const EXAMPLE = `
498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 24,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 93,
      },
    ],
  },
} as AdventOfCodeContest
