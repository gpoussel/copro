import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { DIRECTIONS, fromDirectionChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2015 - Day 3

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString).split("")
  let position = new Vector2(0, 0)
  const visited = new VectorSet<Vector2>()
  visited.add(position)
  for (const direction of input) {
    const dir = fromDirectionChar(direction)
    position = position.move(dir)
    visited.add(position)
  }
  return visited.length
}

function part2(inputString: string) {
  const input = parseInput(inputString).split("")

  let santaPosition = new Vector2(0, 0)
  let roboSantaPosition = new Vector2(0, 0)
  const visited = new VectorSet<Vector2>()
  visited.add(santaPosition)
  for (let i = 0; i < input.length; i++) {
    const dir = fromDirectionChar(input[i])
    if (i % 2 === 0) {
      santaPosition = santaPosition.move(dir)
      visited.add(santaPosition)
    } else {
      roboSantaPosition = roboSantaPosition.move(dir)
      visited.add(roboSantaPosition)
    }
  }
  return visited.length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: ">",
        expected: 2,
      },
      {
        input: "^>v<",
        expected: 4,
      },
      {
        input: "^v^v^v^v^v",
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "^v",
        expected: 3,
      },
      {
        input: "^>v<",
        expected: 3,
      },
      {
        input: "^v^v^v^v^v",
        expected: 11,
      },
    ],
  },
} as AdventOfCodeContest
