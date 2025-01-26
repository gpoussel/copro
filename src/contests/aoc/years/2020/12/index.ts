import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction, fromCompassChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2020 - Day 12

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [action, value] = [line[0], Number(line.slice(1))]
    return { action, value }
  })
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  let direction: Direction = fromCompassChar("E")
  let position = new Vector2(0, 0)
  for (const instruction of instructions) {
    const { action, value } = instruction
    if (action === "N") {
      position = position.move("up", value)
    } else if (action === "S") {
      position = position.move("down", value)
    } else if (action === "E") {
      position = position.move("right", value)
    } else if (action === "W") {
      position = position.move("left", value)
    } else if (action === "L") {
      const count = value / 90
      for (let i = 0; i < count; i++) {
        direction = utils.grid.nextDirCounterClockwise(direction)
      }
    } else if (action === "R") {
      const count = value / 90
      for (let i = 0; i < count; i++) {
        direction = utils.grid.nextDirClockwise(direction)
      }
    } else if (action === "F") {
      position = position.move(direction, value)
    } else {
      throw new Error(action)
    }
  }
  return position.manhattanDistance(new Vector2(0, 0))
}

function rotateClockwiseAroundOrigin(vector: Vector2, degrees: number) {
  const count = degrees / 90
  let result = vector
  for (let i = 0; i < count; i++) {
    result = new Vector2(-result.y, result.x)
  }
  return result
}

function rotateCounterClockwiseAroundOrigin(vector: Vector2, degrees: number) {
  const count = degrees / 90
  let result = vector
  for (let i = 0; i < count; i++) {
    result = new Vector2(result.y, -result.x)
  }
  return result
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  let waypointOffset = new Vector2(10, -1)
  let position = new Vector2(0, 0)
  for (const instruction of instructions) {
    const { action, value } = instruction
    if (action === "N") {
      waypointOffset = waypointOffset.move("up", value)
    } else if (action === "S") {
      waypointOffset = waypointOffset.move("down", value)
    } else if (action === "E") {
      waypointOffset = waypointOffset.move("right", value)
    } else if (action === "W") {
      waypointOffset = waypointOffset.move("left", value)
    } else if (action === "L") {
      waypointOffset = rotateCounterClockwiseAroundOrigin(waypointOffset, value)
    } else if (action === "R") {
      waypointOffset = rotateClockwiseAroundOrigin(waypointOffset, value)
    } else if (action === "F") {
      for (let i = 0; i < value; i++) {
        position = position.add(waypointOffset)
      }
    } else {
      throw new Error(action)
    }
  }
  return position.manhattanDistance(new Vector2(0, 0))
}

const EXAMPLE = `
F10
N3
F7
R90
F11`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 25,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 286,
      },
    ],
  },
} as AdventOfCodeContest
