import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { min } from "../../../../../utils/iterate.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 17

interface WallPosition {
  x: { start: number; end: number }
  y: { start: number; end: number }
}

function parseInput(input: string): WallPosition[] {
  function parseNumberOrNumberRange(str: string) {
    if (str.includes("..")) {
      const [start, end] = str.split("..").map(Number)
      return { start, end }
    }
    return { start: +str, end: +str }
  }
  return utils.input.lines(input).map(line => {
    const [a, b] = line.split(", ")
    const [aKey, aValue] = a.split("=")
    const [bKey, bValue] = b.split("=")
    if (aKey === "x" && bKey === "y") {
      return {
        x: parseNumberOrNumberRange(aValue),
        y: parseNumberOrNumberRange(bValue),
      }
    }
    if (aKey === "y" && bKey === "x") {
      return {
        x: parseNumberOrNumberRange(bValue),
        y: parseNumberOrNumberRange(aValue),
      }
    }
    throw new Error()
  })
}

const EMPTY = "."
const WALL = "#"
const VERTICAL_WATER = "|"
const HORIZONTAL_WATER = "~"

function hasBothWalls(grid: string[][], pos: Vector2) {
  return hasWall(grid, pos, "left") && hasWall(grid, pos, "right")
}

function hasWall(grid: string[][], pos: Vector2, direction: Direction) {
  let currentPosition = pos
  while (utils.grid.inBounds(grid, currentPosition)) {
    const cell = utils.grid.at(grid, currentPosition)
    if (cell === EMPTY) return false
    if (cell === WALL) return true
    currentPosition = currentPosition.move(direction)
  }
}

function fillLevel(grid: string[][], pos: Vector2) {
  fillSide(grid, pos, "left")
  fillSide(grid, pos, "right")
}

function fillSide(grid: string[][], pos: Vector2, direction: Direction) {
  let currentPosition = pos
  while (utils.grid.inBounds(grid, currentPosition)) {
    if (utils.grid.at(grid, currentPosition) === WALL) return
    utils.grid.set(grid, currentPosition, HORIZONTAL_WATER)
    currentPosition = currentPosition.move(direction)
  }
}

function fillFrom(grid: string[][], position: Vector2) {
  if (position.y >= grid.length) return
  const downPosition = position.move("down")
  if (utils.grid.at(grid, downPosition) === EMPTY) {
    utils.grid.set(grid, downPosition, VERTICAL_WATER)
    fillFrom(grid, downPosition)
  }
  for (const dir of ["left", "right"] as const) {
    const sidePosition = position.move(dir)
    if (
      [WALL, HORIZONTAL_WATER].includes(utils.grid.at(grid, downPosition)) &&
      utils.grid.at(grid, sidePosition) === EMPTY
    ) {
      utils.grid.set(grid, sidePosition, VERTICAL_WATER)
      fillFrom(grid, sidePosition)
    }
  }
  if (hasBothWalls(grid, position)) {
    fillLevel(grid, position)
  }
}

function flowWater(inputString: string) {
  const wallPositions = parseInput(inputString)
  const wellPosition = new Vector2(500, 0)
  const { min: minX, max: maxX } = utils.iterate.minMax([
    ...wallPositions.flatMap(wall => [wall.x.start, wall.x.end]),
    wellPosition.x,
  ])
  const gridMinX = Math.min(minX - 1, wellPosition.x)
  const gridMaxX = Math.max(maxX + 1, wellPosition.x)
  const { min: minY, max: maxY } = utils.iterate.minMax([...wallPositions.flatMap(wall => [wall.y.start, wall.y.end])])
  const gridMinY = Math.min(minY, wellPosition.y)
  const gridMaxY = maxY
  const width = gridMaxX - gridMinX + 1
  const height = gridMaxY - gridMinY + 1
  const topLeftCorner = new Vector2(gridMinX, gridMinY)
  const grid = utils.grid.create(width, height, EMPTY)
  wallPositions.forEach(wall => {
    for (let y = wall.y.start; y <= wall.y.end; y++) {
      for (let x = wall.x.start; x <= wall.x.end; x++) {
        utils.grid.set(grid, new Vector2(x, y).subtract(topLeftCorner), WALL)
      }
    }
  })
  fillFrom(grid, new Vector2(500, 0).subtract(topLeftCorner))

  const flowingCount = utils.grid
    .findPositions(grid, cell => cell === VERTICAL_WATER)
    .filter(p => p.y >= minY && p.y <= maxY).length
  const settledCount = utils.grid
    .findPositions(grid, cell => cell === HORIZONTAL_WATER)
    .filter(p => p.y >= minY && p.y <= maxY).length
  return {
    flowing: flowingCount,
    settled: settledCount,
  }
}

function part1(inputString: string) {
  const { flowing, settled } = flowWater(inputString)
  return flowing + settled
}

function part2(inputString: string) {
  const { settled } = flowWater(inputString)
  return settled
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504`,
        expected: 57,
      },
      {
        input: `
x=495, y=2..7
x=505, y=2..7
y=7, x=495..505
x=499, y=4..6
x=501, y=4..6
y=6, x=499..501`,
        expected: 50,
      },
      {
        input: `
x=500, y=3..4
x=497, y=5..6
x=503, y=5..6`,
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504`,
        expected: 29,
      },
    ],
  },
} as AdventOfCodeContest
