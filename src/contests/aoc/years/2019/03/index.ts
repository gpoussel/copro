import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 3

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    return line.split(",").map(segment => {
      return {
        direction: segment[0],
        distance: Number(segment.slice(1)),
      }
    })
  })
}

function getAllPositions(wireSegments: ReturnType<typeof parseInput>[0]) {
  const positions = new Map<string, number>()
  let position = new Vector2(0, 0)
  let time = 0
  for (const wireSegment of wireSegments) {
    const { direction, distance } = wireSegment
    const dir = { U: "up", D: "down", L: "left", R: "right" }[direction] as Direction
    for (let i = 0; i < distance; i++) {
      position = position.move(dir)
      ++time
      if (!positions.has(position.str())) {
        positions.set(position.str(), time)
      }
    }
    utils.log.logEvery(positions.size, 15_000)
  }
  return positions
}

function getIntersections(inputString: string) {
  const input = parseInput(inputString)
  const wire1 = getAllPositions(input[0])
  const wire2 = getAllPositions(input[1])
  const intersectionPoints = new VectorSet([...wire1.keys()].filter(key => wire2.has(key)).map(Vector2.fromKey)).vectors
  return { intersectionPoints, wire1, wire2 }
}

function part1(inputString: string) {
  const { intersectionPoints } = getIntersections(inputString)
  const origin = new Vector2(0, 0)
  const closestIntersectionPoint = utils.iterate.minBy(
    intersectionPoints,
    (a, b) => a.manhattanDistance(origin) - b.manhattanDistance(origin)
  )
  return closestIntersectionPoint.manhattanDistance(origin)
}

function part2(inputString: string) {
  const { wire1, wire2, intersectionPoints } = getIntersections(inputString)
  const shortestIntersectionPoint = utils.iterate.minBy(
    intersectionPoints,
    (a, b) => wire1.get(a.str())! + wire2.get(a.str())! - wire1.get(b.str())! - wire2.get(b.str())!
  )
  return wire1.get(shortestIntersectionPoint.str())! + wire2.get(shortestIntersectionPoint.str())!
}

const EXAMPLE1 = `
R8,U5,L5,D3
U7,R6,D4,L4`

const EXAMPLE2 = `
R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83`

const EXAMPLE3 = `
R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 6,
      },
      {
        input: EXAMPLE2,
        expected: 159,
      },
      {
        input: EXAMPLE3,
        expected: 135,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 30,
      },
      {
        input: EXAMPLE2,
        expected: 610,
      },
      {
        input: EXAMPLE3,
        expected: 410,
      },
    ],
  },
} as AdventOfCodeContest
