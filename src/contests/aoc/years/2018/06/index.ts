import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 6

function parseInput(input: string) {
  return utils.input
    .lines(input)
    .map(line => line.split(", ").map(Number))
    .map(([x, y]) => new Vector2(x, y))
}

function getBounds(points: Vector2[]) {
  const minX = Math.min(...points.map(p => p.x))
  const minY = Math.min(...points.map(p => p.y))
  const maxX = Math.max(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))
  return { minX, minY, maxX, maxY }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const { minX, minY, maxX, maxY } = getBounds(input)
  const grid = utils.grid.create(maxX - minX + 1, maxY - minY + 1, ".")
  const gridOfClosestPoint = utils.grid.map(grid, (_, x, y) => {
    const position = new Vector2(x + minX, y + minY)
    const distances = input.map(p => ({ point: p, distance: p.manhattanDistance(position) }))
    const closest = distances.sort((a, b) => a.distance - b.distance)
    if (closest[0].distance === closest[1].distance) {
      return "."
    }
    return input
      .map(p => p.str())
      .indexOf(closest[0].point.str())
      .toString()
  })

  const infinitePoints = new Set<string>()
  const gridColumns = utils.grid.columns(gridOfClosestPoint)
  gridColumns[0].forEach(point => infinitePoints.add(point))
  gridColumns[gridColumns.length - 1].forEach(point => infinitePoints.add(point))
  gridOfClosestPoint[0].forEach(point => infinitePoints.add(point))
  gridOfClosestPoint[gridOfClosestPoint.length - 1].forEach(point => infinitePoints.add(point))
  infinitePoints.add(".")

  const possibleBiggestAreas = utils.iterate.differenceBy(gridOfClosestPoint.flat(), [...infinitePoints], c => c)
  const allAreas = gridOfClosestPoint.map(g => g.filter(c => possibleBiggestAreas.includes(c))).flat()
  const areasSize = utils.iterate.countBy(allAreas, c => c)
  return Math.max(...areasSize.values())
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { minX, minY, maxX, maxY } = getBounds(input)
  let numberOfLocationsInSafeRegion = 0
  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {
      const position = new Vector2(i, j)
      const totalDistance = input.reduce((sum, p) => sum + p.manhattanDistance(position), 0)
      if (totalDistance < 10000) {
        numberOfLocationsInSafeRegion++
      }
    }
  }
  return numberOfLocationsInSafeRegion
}

const EXAMPLE = `
1, 1
1, 6
8, 3
3, 4
5, 5
8, 9`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 17,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
