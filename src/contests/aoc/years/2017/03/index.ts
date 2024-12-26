import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2017 - Day 3

function parseInput(input: string) {
  return utils.input.number(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  // It is Ulam's spiral
  let sideLength = 0
  let n = 1
  let position = new Vector2(0, 0)
  while (n < input) {
    sideLength += 2
    n += sideLength * 4
    position = position.move("down-right")
  }
  for (const dir of ["left", "up", "right", "down"] as Direction[]) {
    if (input >= n - sideLength) {
      position = position.move(dir, input - (n - sideLength))
      break
    } else {
      position = position.move(dir, sideLength)
      n -= sideLength
    }
  }
  return position.manhattanDistance(new Vector2(0, 0))
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const grid = new Map<string, number>()
  let sideLength = 0
  let n = 1
  let position = new Vector2(0, 0)
  grid.set(position.str(), 1)

  let numberFound: number | undefined = undefined

  function recordValueAt(position: Vector2) {
    if (numberFound) {
      return
    }
    const newValue = position
      .neighbors()
      .map(neighbor => grid.get(neighbor.str()) || 0)
      .reduce((a, b) => a + b, 0)
    if (newValue > input) {
      numberFound = newValue
    } else {
      grid.set(position.str(), newValue)
    }
  }

  while (!numberFound) {
    for (const dir of ["right", "up"] as Direction[]) {
      for (let i = 0; i <= sideLength; ++i) {
        n++
        position = position.move(dir)
        recordValueAt(position)
      }
    }
    for (const dir of ["left", "down"] as Direction[]) {
      for (let i = 0; i <= sideLength + 1; ++i) {
        n++
        position = position.move(dir)
        recordValueAt(position)
      }
    }
    sideLength += 2
  }
  return numberFound
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "1",
        expected: 0,
      },
      {
        input: "12",
        expected: 3,
      },
      {
        input: "23",
        expected: 2,
      },
      {
        input: "1024",
        expected: 31,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
