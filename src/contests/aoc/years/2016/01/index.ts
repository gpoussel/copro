import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction, nextDir } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 1

function parseInput(input: string) {
  return utils.input
    .firstLine(input)
    .split(", ")
    .map(move => ({ dir: move[0], dist: +move.slice(1) }))
}

function part1(inputString: string) {
  const moves = parseInput(inputString)
  let direction: Direction = "up"
  let position = new Vector2(0, 0)
  for (const move of moves) {
    direction = nextDir(direction, move.dir === "R")
    position = position.move(direction, move.dist)
  }
  return position.manhattanDistance(new Vector2(0, 0))
}

function part2(inputString: string) {
  const moves = parseInput(inputString)
  let direction: Direction = "up"
  let position = new Vector2(0, 0)
  const visited = new VectorSet<Vector2>()
  for (const move of moves) {
    direction = nextDir(direction, move.dir === "R")
    for (let i = 0; i < move.dist; i++) {
      position = position.move(direction, 1)
      if (visited.contains(position)) {
        return position.manhattanDistance(new Vector2(0, 0))
      }
      visited.add(position)
    }
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "R2, L3",
        expected: 5,
      },
      {
        input: "R2, R2, R2",
        expected: 2,
      },
      {
        input: "R5, L5, R5, R3",
        expected: 12,
      },
      {
        input: "R5, L5, R5, R3, L5, R5, R3",
        expected: 15,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "R8, R4, R4, R8",
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
