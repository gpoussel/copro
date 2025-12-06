import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 17

function parseInput(input: string) {
  return utils.input.firstLine(input).split("") as ("<" | ">")[]
}

const CHAMBER_WIDTH = 7

// Rock shapes as arrays of [x, y] offsets from bottom-left
const ROCK_SHAPES = [
  // Horizontal line ####
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  // Plus shape .#. / ### / .#.
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  // L shape (reversed) ### / ..# / ..#
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  // Vertical line
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  // Square
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
]

function simulate(instructions: ("<" | ">")[], targetRocks: number): number {
  const chamber = new Set<string>()
  let jetIndex = 0
  let maxHeight = 0

  const key = (x: number, y: number) => `${x},${y}`
  const isBlocked = (x: number, y: number) => x < 0 || x >= CHAMBER_WIDTH || y < 0 || chamber.has(key(x, y))

  // For cycle detection: map state -> [rockIndex, height]
  const seen = new Map<string, [number, number]>()
  let additionalHeight = 0

  for (let i = 0; i < targetRocks; ++i) {
    const shapeIndex = i % ROCK_SHAPES.length
    const shape = ROCK_SHAPES[shapeIndex]
    let rockX = 2
    let rockY = maxHeight + 3

    while (true) {
      // Apply jet push
      const jetPush = instructions[jetIndex % instructions.length] === "<" ? -1 : 1
      jetIndex = (jetIndex + 1) % instructions.length

      // Check if we can move horizontally
      const canMoveHorizontally = shape.every(([dx, dy]) => !isBlocked(rockX + dx + jetPush, rockY + dy))
      if (canMoveHorizontally) {
        rockX += jetPush
      }

      // Apply gravity - check if we can move down
      const canMoveDown = shape.every(([dx, dy]) => !isBlocked(rockX + dx, rockY + dy - 1))
      if (canMoveDown) {
        rockY--
      } else {
        // Settle the rock
        for (const [dx, dy] of shape) {
          chamber.add(key(rockX + dx, rockY + dy))
          maxHeight = Math.max(maxHeight, rockY + dy + 1)
        }
        break
      }
    }

    // Cycle detection (only for large targets)
    if (additionalHeight === 0 && targetRocks > 10000) {
      // Create a fingerprint of the top rows + current state
      const topRows: number[] = []
      for (let y = maxHeight - 1; y >= Math.max(0, maxHeight - 30); y--) {
        let row = 0
        for (let x = 0; x < CHAMBER_WIDTH; x++) {
          if (chamber.has(key(x, y))) row |= 1 << x
        }
        topRows.push(row)
      }
      const stateKey = `${shapeIndex},${jetIndex},${topRows.join("|")}`

      if (seen.has(stateKey)) {
        const [prevRock, prevHeight] = seen.get(stateKey)!
        const cycleLength = i - prevRock
        const cycleHeight = maxHeight - prevHeight
        const remainingRocks = targetRocks - i - 1
        const fullCycles = Math.floor(remainingRocks / cycleLength)
        additionalHeight = fullCycles * cycleHeight
        // Skip ahead
        i += fullCycles * cycleLength
      } else {
        seen.set(stateKey, [i, maxHeight])
      }
    }
  }

  return maxHeight + additionalHeight
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  return simulate(instructions, 2022)
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  return simulate(instructions, 1000000000000)
}

const EXAMPLE = `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3068,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1514285714288,
      },
    ],
  },
} as AdventOfCodeContest
