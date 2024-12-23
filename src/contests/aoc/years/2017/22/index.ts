import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2017 - Day 22

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const gridContent = new Map<string, string>()
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      gridContent.set(new Vector2(x, y).str(), cell)
    })
  })
  return gridContent
}

const INFECTED = "#"
const CLEAN = "."
const WEAKENED = "W"
const FLAGGED = "F"
const NEXT_STATES = {
  [CLEAN]: WEAKENED,
  [WEAKENED]: INFECTED,
  [INFECTED]: FLAGGED,
  [FLAGGED]: CLEAN,
}

function part1(inputString: string) {
  const gridContent = parseInput(inputString)

  const center = (Math.sqrt(gridContent.size) - 1) / 2
  let position = new Vector2(center, center)
  let direction: Direction = "up"
  let infections = 0

  for (let i = 0; i < 10000; i++) {
    const node = gridContent.get(position.str()) ?? CLEAN
    if (node === INFECTED) {
      direction = utils.grid.nextDirClockwise(direction)
    } else {
      direction = utils.grid.nextDirCounterClockwise(direction)
    }
    const newNode = node === INFECTED ? CLEAN : INFECTED
    if (newNode === INFECTED) {
      infections++
    }
    gridContent.set(position.str(), newNode)
    position = position.move(direction)
  }

  return infections
}

function part2(inputString: string) {
  const gridContent = parseInput(inputString)

  const center = (Math.sqrt(gridContent.size) - 1) / 2
  let position = new Vector2(center, center)
  let direction: Direction = "up"
  let infections = 0

  for (let i = 0; i < 10000000; i++) {
    const node = gridContent.get(position.str()) ?? CLEAN
    if (node === CLEAN) {
      direction = utils.grid.nextDirCounterClockwise(direction)
    } else if (node === INFECTED) {
      direction = utils.grid.nextDirClockwise(direction)
    } else if (node === FLAGGED) {
      direction = utils.grid.nextDirClockwise(utils.grid.nextDirClockwise(direction))
    }
    const newNode = NEXT_STATES[node as keyof typeof NEXT_STATES]
    if (newNode === INFECTED) {
      infections++
    }
    gridContent.set(position.str(), newNode)
    position = position.move(direction)
  }

  return infections
}

const EXAMPLE = `
..#
#..
...`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5587,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2511944,
      },
    ],
  },
} as AdventOfCodeContest
