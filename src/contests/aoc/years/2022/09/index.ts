import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 9

type Direction = "U" | "D" | "L" | "R"

const MOVEMENTS = {
  U: new Vector2(0, -1),
  D: new Vector2(0, 1),
  L: new Vector2(-1, 0),
  R: new Vector2(1, 0),
}

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [dir, countStr] = line.split(" ")
    return { direction: dir as Direction, count: +countStr }
  })
}

function part1(inputString: string) {
  const directions = parseInput(inputString)
  let headPosition = new Vector2(0, 0)
  let tailPosition = new Vector2(0, 0)
  const visitedTailPositions = new Set<string>()
  visitedTailPositions.add(tailPosition.str())
  for (const direction of directions) {
    for (let i = 0; i < direction.count; i++) {
      headPosition = headPosition.add(MOVEMENTS[direction.direction])
      const delta = headPosition.subtract(tailPosition)
      if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
        tailPosition = tailPosition.add(new Vector2(Math.sign(delta.x), Math.sign(delta.y)))
        visitedTailPositions.add(tailPosition.str())
      }
    }
  }
  return visitedTailPositions.size
}

function part2(inputString: string) {
  const directions = parseInput(inputString)
  const knotPositions = Array.from({ length: 10 }, () => new Vector2(0, 0))
  const visitedPositions = new Set<string>()
  visitedPositions.add(knotPositions[9].str())
  for (const direction of directions) {
    for (let i = 0; i < direction.count; i++) {
      knotPositions[0] = knotPositions[0].add(MOVEMENTS[direction.direction])
      for (let k = 1; k < knotPositions.length; k++) {
        const headPosition = knotPositions[k - 1]
        let tailPosition = knotPositions[k]
        const delta = headPosition.subtract(tailPosition)
        if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
          tailPosition = tailPosition.add(new Vector2(Math.sign(delta.x), Math.sign(delta.y)))
          knotPositions[k] = tailPosition
          if (k === knotPositions.length - 1) {
            visitedPositions.add(tailPosition.str())
          }
        }
      }
    }
  }
  return visitedPositions.size
}

const EXAMPLE = `
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`

const EXAMPLE2 = `
R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 13,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1,
      },
      {
        input: EXAMPLE2,
        expected: 36,
      },
    ],
  },
} as AdventOfCodeContest
