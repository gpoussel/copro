import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2025 - Day 9

function parseInput(input: string) {
  return utils.input.lines(input).map(line => Vector2.fromKey(line))
}

function part1(inputString: string) {
  const points = parseInput(inputString)
  let largestArea = 0
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i]
      const p2 = points[j]
      const area = Math.abs(p1.x - p2.x + 1) * Math.abs(p1.y - p2.y + 1)
      if (area > largestArea) {
        largestArea = area
      }
    }
  }
  return largestArea
}

function isInside(pt1: Vector2, pt2: Vector2, polygon: Vector2[]): boolean {
  const xMin = Math.min(pt1.x, pt2.x)
  const xMax = Math.max(pt1.x, pt2.x)
  const yMin = Math.min(pt1.y, pt2.y)
  const yMax = Math.max(pt1.y, pt2.y)
  for (let i = 0; i < polygon.length; i++) {
    const x1 = polygon[i].x
    const y1 = polygon[i].y
    const x2 = polygon[(i + 1) % polygon.length].x
    const y2 = polygon[(i + 1) % polygon.length].y
    if (y1 === y2) {
      if (
        yMin < y1 &&
        y1 < yMax &&
        ((Math.min(x1, x2) <= xMin && xMin < Math.max(x1, x2)) || (Math.min(x1, x2) < xMax && xMax <= Math.max(x1, x2)))
      ) {
        return false
      }
    } else if (x1 === x2) {
      if (
        xMin < x1 &&
        x1 < xMax &&
        ((Math.min(y1, y2) <= yMin && yMin < Math.max(y1, y2)) || (Math.min(y1, y2) < yMax && yMax <= Math.max(y1, y2)))
      ) {
        return false
      }
    } else {
      throw new Error("Works only for axis-aligned polygons")
    }
  }
  return true
}

function part2(inputString: string) {
  const polygon = parseInput(inputString)

  let largestArea = 0
  for (let i = 0; i < polygon.length; i++) {
    for (let j = i + 1; j < polygon.length; j++) {
      const p1 = polygon[i]
      const p2 = polygon[j]
      const area = (Math.abs(p2.x - p1.x) + 1) * (Math.abs(p2.y - p1.y) + 1)
      if (area > largestArea && isInside(p1, p2, polygon)) {
        largestArea = area
      }
    }
  }
  return largestArea
}

const EXAMPLE = `
7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 50,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 24,
      },
    ],
  },
} as AdventOfCodeContest
