import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 18

function parseInput(input: string) {
  const walls = utils.input
    .lines(input)
    .map(line => line.split(",").map(Number))
    .map(([x, y]) => Vector2.fromCoordinates({ x, y }))
  const gridSize = walls.length > 100 ? 71 : 7
  const part1Count = walls.length > 100 ? 1024 : 12
  const startPosition = new Vector2(0, 0)
  const endPosition = new Vector2(gridSize - 1, gridSize - 1)
  return { walls, gridSize, part1Count, startPosition, endPosition }
}

function getMinDistance(walls: Vector2[], start: Vector2, end: Vector2, gridSize: number) {
  const wallSet = new VectorSet(walls)
  const bfsResult = breadthFirstSearch(start, {
    key(node) {
      return node.str()
    },
    adjacents(node) {
      return node
        .plusShapeNeighbors()
        .filter(n => !wallSet.contains(n) && n.x >= 0 && n.y >= 0 && n.x < gridSize && n.y < gridSize)
    },
    ends(node) {
      return node.equals(end)
    },
  })
  return bfsResult?.distance
}

function part1(inputString: string) {
  const { walls, part1Count, startPosition, endPosition, gridSize } = parseInput(inputString)
  const wallsReduced = walls.slice(0, part1Count)

  return getMinDistance(wallsReduced, startPosition, endPosition, gridSize)
}

function part2(inputString: string) {
  const { walls, startPosition, endPosition, gridSize, part1Count } = parseInput(inputString)
  for (let i = part1Count; i < walls.length; i++) {
    if (getMinDistance(walls.slice(0, i), startPosition, endPosition, gridSize) === undefined) {
      return walls[i - 1].str()
    }
    utils.log.logEvery(i, 500)
  }
  throw new Error()
}

const EXAMPLE = `
5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 22,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "6,1",
      },
    ],
  },
} as AdventOfCodeContest
